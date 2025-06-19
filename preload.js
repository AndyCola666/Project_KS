const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  seleccionarCarpeta: () => ipcRenderer.invoke('seleccionar-carpeta')
});
