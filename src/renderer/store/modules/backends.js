// eslint-disable-next-line import/no-extraneous-dependencies
import { remote } from 'electron';
import { platform } from 'os';
import path from 'path';
import worker from '../../../worker';
const { dialog } = remote;

const namespaced = true;

const state = {
  executables: [],
  selectedIndex: null,
};

const getters = {
  executables(state) {
    return state.executables;
  },
  selectedIndex(state) {
    return state.selectedIndex;
  },
  selected(state) {
    return state.executables[state.selectedIndex];
  },
};

const mutations = {
  add(state, info) {
    info.path = path.normalize(info.path);

    if (state.executables.some(executable => executable.path === info.path)) {
      return;
    }

    state.executables.push(info);

    if (state.selectedIndex === null) {
      state.selectedIndex = 0;
    }
  },
  remove(state, info) {
    state.executables = state.executables.filter(executable => executable.path !== info.path);

    if (state.executables.length === 0) {
      state.selectedIndex = null;
    } else if (state.selectedIndex > state.executables.length - 1) {
      state.selectedIndex = state.executables.length - 1;
    }
  },
  removeAll(state) {
    state.executables = [];
    state.selectedIndex = null;
  },
  select(state, path) {
    state.selectedIndex = path;
  },
};

const actions = {
  async removeSelected({ commit, getters }) {
    commit('remove', getters.selected);
  },
  async scan({ commit }) {
    const infos = await worker.scanForBackends();

    infos.forEach((info) => {
      commit('add', info);
    });
  },
  find({ commit, state }) {
    let type;

    dialog.showMessageBox({
      type: 'question',
      message: 'Do you want to add Matlab or Octave to the list of executables?',
      buttons: ['Cancel', 'Matlab', 'Octave'],
    }, (result) => {
      const filters = {};

      switch (result) {
        case 0:
          return;
        case 1:
          type = 'matlab';
          break;
        case 2:
          type = 'octave';

          filters.name = process.platform === 'win32' ? 'octave-cli.exe' : 'octave';
          break;
        default:
          throw new Error('invalid selection');
      }

      const options = {
        filters,
        properties: ['openFile', 'treatPackageAsDirectory'],
        message: `Please select the ${type} executable`,
      };

      dialog.showOpenDialog(options, (async (filePaths) => {
        if (!filePaths) {
          return;
        }

        let path = filePaths[0];

        if (platform() === 'darwin' && type === 'matlab' && path.endsWith('.app')) {
          // special treatment for matlab on macOS
          // the matlab .app "file" actually is a folder, so append the proper path
          path += '/bin/matlab';
        }

        const info = await worker.getExecutableInfo({
          path,
          type,
        });

        if (!info.isExecutable) {
          dialog.showErrorBox(
            'Not an executable',
            `The file you provided (${info.path}) is not an executable or you lack execution permissions. Please select an executable file.`,
          );

          return;
        }

        commit('add', info);

        const index = state.executables.indexOf(info);
        commit('select', index);
      }));
    });
  },
};

export default {
  namespaced,
  state,
  getters,
  mutations,
  actions,
};
