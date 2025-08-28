def descargar_video(url)
  carpeta = "D:/pruebakaraoke/Artistas/Jose Jose"

  unless Dir.exist?(carpeta)
    puts "La carpeta '#{carpeta}' no existe."
    return
  end

  salida = "#{carpeta}/%(title)s.%(ext)s"
  formatos = %w[mp4 mkv mov avi]
  descargado = false

  formatos.each do |formato|
    comando = "yt-dlp --no-playlist --no-check-certificate --no-warnings -f \"bestvideo[height<=720]+bestaudio/best[height<=720]\" --concurrent-fragments 8 --merge-output-format #{formato} -o \"#{salida}\" \"#{url}\""
    puts "\nIntentando descargar en formato #{formato}..."
    puts "Guardando en: #{carpeta}"
    resultado = system(comando)
    if resultado
      puts "Descarga exitosa en formato #{formato}."
      descargado = true
      break
    else
      puts "No se pudo descargar en formato #{formato}, intentando el siguiente..."
    end
  end

  puts "No se pudo descargar el video en ninguno de los formatos permitidos." unless descargado
end

print "Introduce la URL del video de YouTube: "
url = gets.chomp

if url.strip.empty?
  puts "URL vacía. Saliendo."
else
  descargar_video(url)
end
