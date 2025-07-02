const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('api', {
  seleccionarCarpeta: () => ipcRenderer.invoke('seleccionar-carpeta'),
  actualizarBase: (rutaCarpeta) => ipcRenderer.invoke('actualizar-base', rutaCarpeta),
  validarAdmin: (usuario, password) => ipcRenderer.invoke('validar-admin', usuario, password),
  adminListar: () => ipcRenderer.invoke('admin-listar'),
  adminAgregar: (usuario, password) => ipcRenderer.invoke('admin-agregar', usuario, password),
  adminEditar: (id, usuario, password) => ipcRenderer.invoke('admin-editar', id, usuario, password),
  videosListar: () => ipcRenderer.invoke('videos-listar'),
  videoEditarMetadatos: (id, datos) => ipcRenderer.invoke('video-editar-metadatos', id, datos),
});


