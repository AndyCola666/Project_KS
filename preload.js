const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('api', {
  seleccionarCarpeta: () => ipcRenderer.invoke('seleccionar-carpeta'),
  actualizarBase: (rutaCarpeta) => ipcRenderer.invoke('actualizar-base', rutaCarpeta),
  adminLogin: (usuario, password) => ipcRenderer.invoke('admin-login', usuario, password),
  adminListar: () => ipcRenderer.invoke('admin-listar'),
  adminAgregar: (usuario, password) => ipcRenderer.invoke('admin-agregar', usuario, password),
  adminEditar: (id, usuario, password) => ipcRenderer.invoke('admin-editar', id, usuario, password),
  adminEliminar: (id) => ipcRenderer.invoke('admin-eliminar', id),
  videosListar: () => ipcRenderer.invoke('videos-listar'),
  videoEditarMetadatos: (id, datos) => ipcRenderer.invoke('video-editar-metadatos', id, datos),// Editar metadatos de un video
});


