Add-Type -AssemblyName System.Drawing

$out = Join-Path $PSScriptRoot '..\assets'
New-Item -ItemType Directory -Force -Path $out | Out-Null

# Make a clean, high-resolution app icon from the heart in the supplied image.
$source = [System.Drawing.Bitmap]::FromFile((Join-Path $out 'source-heart.jpg'))
$icon = [System.Drawing.Bitmap]::new(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($icon)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::FromArgb(10, 40, 91))
$rawHeart = [System.Drawing.Bitmap]::new(350, 310, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y=0; $y -lt 310; $y++) {
  for ($x=0; $x -lt 350; $x++) {
    $p = $source.GetPixel(530+$x, 230+$y)
    $signal = [math]::Min($p.R-$p.G, $p.R-$p.B)
    $alpha = [math]::Max(0, [math]::Min(255, (($signal - 25) / 75.0) * 255))
    if ($alpha -gt 0) { $rawHeart.SetPixel($x, $y, [System.Drawing.Color]::FromArgb([int]$alpha, $p.R, $p.G, $p.B)) }
  }
}
$g.DrawImage($rawHeart, [System.Drawing.Rectangle]::new(20, 35, 472, 418))
$icon.Save((Join-Path $out 'icon-512.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$small = [System.Drawing.Bitmap]::new(192, 192, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gs = [System.Drawing.Graphics]::FromImage($small)
$gs.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gs.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gs.DrawImage($icon, 0, 0, 192, 192)
$small.Save((Join-Path $out 'icon-192.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$gs.Dispose(); $small.Dispose(); $g.Dispose(); $rawHeart.Dispose(); $icon.Dispose(); $source.Dispose()

# Remove the solid dark background around the supplied teddy sticker, keeping its outline.
$bearSource = [System.Drawing.Bitmap]::FromFile((Join-Path $out 'source-teddy.png'))
$w = $bearSource.Width; $h = $bearSource.Height
$bg = $bearSource.GetPixel(0,0)
$seen = [bool[]]::new($w * $h)
$queue = [System.Collections.Generic.Queue[int]]::new()
for ($x=0; $x -lt $w; $x++) { $queue.Enqueue($x); $queue.Enqueue(($h-1)*$w+$x) }
for ($y=1; $y -lt $h-1; $y++) { $queue.Enqueue($y*$w); $queue.Enqueue($y*$w+$w-1) }
while ($queue.Count -gt 0) {
  $i = $queue.Dequeue()
  if ($i -lt 0 -or $i -ge $seen.Length -or $seen[$i]) { continue }
  $seen[$i] = $true
  $p = $bearSource.GetPixel($i % $w, [math]::Floor($i / $w))
  $distance = [math]::Sqrt([math]::Pow($p.R-$bg.R,2)+[math]::Pow($p.G-$bg.G,2)+[math]::Pow($p.B-$bg.B,2))
  if ($distance -le 40) {
    $bearSource.SetPixel($i % $w, [math]::Floor($i / $w), [System.Drawing.Color]::FromArgb(0,$p.R,$p.G,$p.B))
    $x = $i % $w; $y = [math]::Floor($i / $w)
    if ($x -gt 0) { $queue.Enqueue($i-1) }; if ($x -lt $w-1) { $queue.Enqueue($i+1) }
    if ($y -gt 0) { $queue.Enqueue($i-$w) }; if ($y -lt $h-1) { $queue.Enqueue($i+$w) }
  }
}
$bear = [System.Drawing.Bitmap]::new(600, 480, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gb = [System.Drawing.Graphics]::FromImage($bear)
$gb.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gb.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gb.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gb.Clear([System.Drawing.Color]::Transparent)
$gb.DrawImage($bearSource, [System.Drawing.Rectangle]::new(45, 18, 510, 444), [System.Drawing.Rectangle]::new(13, 8, 142, 115), [System.Drawing.GraphicsUnit]::Pixel)
$bear.Save((Join-Path $out 'teddy.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$gb.Dispose(); $bear.Dispose(); $bearSource.Dispose()

Copy-Item (Join-Path $out 'source-telegram-pattern.png') (Join-Path $out 'telegram-pattern.png') -Force
