def descargar_video(url)
  carpeta = "D:/pruebakaraoke/Artistas/Banda MS"

  unless Dir.exist?(carpeta)
    puts "La carpeta '#{carpeta}' no existe."
    return
  end

  salida = "#{carpeta}/%(title)s.%(ext)s"

  #Descarga de formato y eliminación de archivos para fusión de video y audio
  formato = "bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[ext=mp4][height<=720]/best"

  comando = "yt-dlp --no-playlist -f \"#{formato}\" -o \"#{salida}\" \"#{url}\""

  puts "\nDescargando video en .mp4 (máx 720p o menor si no hay)..."
  puts "Guardando en: #{carpeta}"
  system(comando)

end
#Consola 
print "Introduce la URL del video de YouTube: "
url = gets.chomp

if url.strip.empty?
  puts "URL vacía. Saliendo."
else
  descargar_video(url)
end
