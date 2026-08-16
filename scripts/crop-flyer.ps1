Add-Type -AssemblyName System.Drawing

$filePath = "C:\Users\Usuário\.gemini\antigravity\scratch\zeroweb-repo\public\images\renata-beauty-flyer.jpg"
$destFolder = "C:\Users\Usuário\.gemini\antigravity\scratch\zeroweb-repo\public\images"

$bytes = [System.IO.File]::ReadAllBytes($filePath)
$ms = [System.IO.MemoryStream]::new($bytes)
$src = [System.Drawing.Image]::FromStream($ms)

$w = [int]$src.Width
$h = [int]$src.Height

# 1. Volume Egípcio (Top right eye)
$cw1 = [int]($w * 0.48)
$ch1 = [int]($h * 0.30)
$bmp1 = [System.Drawing.Bitmap]::new($cw1, $ch1)
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
$g1.DrawImage($src, [System.Drawing.Rectangle]::new(0, 0, $cw1, $ch1), [System.Drawing.Rectangle]::new([int]($w * 0.50), [int]($h * 0.05), $cw1, $ch1), [System.Drawing.GraphicsUnit]::Pixel)
$bmp1.Save((Join-Path $destFolder "volume-egipcio.jpg"), [System.Drawing.Imaging.ImageFormat]::Jpeg)
$g1.Dispose()
$bmp1.Dispose()

# 2. Volume Brasileiro (Middle eye)
$cw2 = [int]($w * 0.48)
$ch2 = [int]($h * 0.25)
$bmp2 = [System.Drawing.Bitmap]::new($cw2, $ch2)
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.DrawImage($src, [System.Drawing.Rectangle]::new(0, 0, $cw2, $ch2), [System.Drawing.Rectangle]::new([int]($w * 0.50), [int]($h * 0.35), $cw2, $ch2), [System.Drawing.GraphicsUnit]::Pixel)
$bmp2.Save((Join-Path $destFolder "volume-brasileiro.jpg"), [System.Drawing.Imaging.ImageFormat]::Jpeg)
$g2.Dispose()
$bmp2.Dispose()

# 3. Lash Mapping (Bottom eye)
$cw3 = [int]($w * 0.48)
$ch3 = [int]($h * 0.28)
$bmp3 = [System.Drawing.Bitmap]::new($cw3, $ch3)
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.DrawImage($src, [System.Drawing.Rectangle]::new(0, 0, $cw3, $ch3), [System.Drawing.Rectangle]::new([int]($w * 0.50), [int]($h * 0.58), $cw3, $ch3), [System.Drawing.GraphicsUnit]::Pixel)
$bmp3.Save((Join-Path $destFolder "lash-mapping.jpg"), [System.Drawing.Imaging.ImageFormat]::Jpeg)
$g3.Dispose()
$bmp3.Dispose()

$src.Dispose()
$ms.Dispose()

Write-Host "DONE: Real lash images created in public/images!"
