#rem
	Simple plasma demo

TODO: none portable due to canvaswrapper

By T. Luyben (tycho@e-lab.nl)
All code falls under BSD License	
#End 

Import mojo 
Import canvaswrapper ' direct framebuffer access


Const SCREEN_WIDTH = 640	
Const SCREEN_HEIGHT = 480
Const STEP_SIZE:Int = 1

Class Color 
	Public Field r,g,b
	Method New()
	End
	
	Method New(r,g,b) 
		Self.r = r
		Self.g = g
		Self.b = b
	End
End

Class Plasma Extends App 
	Field colors:Color[256]
	Field asin:Int[512]
	Field pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, tpos1, tpos2, tpos3, tpos4
	Field x,index
	
	Field imd:ImageData
	Field width:Int, height:Int
	
	Method OnCreate()
		width = DeviceWidth()
		height = DeviceHeight()
	
		For Local i=0 Until 512
			Local rad:Float = (i * 0.703125) * 0.0174532
			asin[i] = Sinr(rad) * 1024
		End
		
		For Local i=0 Until 64
			colors[i] = New Color
			colors[i].r = i Shl 2;
	      	colors[i].g = 255 - ((i Shl 2) + 1);
			colors[i+64] = New Color 
	      	colors[i+64].r = 255;
	      	colors[i+64].g = (i Shl 2) + 1;
			colors[i+128] = New Color 
	      	colors[i+128].r = 255 - ((i Shl 2) + 1);
	      	colors[i+128].g = 255 - ((i Shl 2) + 1);
			colors[i+192] = New Color 
	      	colors[i+192].g = (i Shl 2) + 1; 
		End	
		
		imd = xCanvas.CreateImageData(width, height)

		SetUpdateRate 60
	End
	
	Method OnRender() 
	
		'Cls 0,0,0 
		
     	tpos4 = pos4
      	tpos3 = pos3
		
		For Local i=0 Until SCREEN_HEIGHT Step STEP_SIZE
			tpos1 = pos1 + 5
	  		tpos2 = pos2 + 3
	  
	  		tpos3 = tpos3 & 511
	  		tpos4 = tpos3 & 511
	
			For Local j=0 Until SCREEN_WIDTH Step STEP_SIZE
				tpos1 = tpos1 & 511
				tpos2 = tpos2 & 511
				
				x = asin[tpos1] + asin[tpos2] + asin[tpos3] + asin[tpos4]
				index = 128 + (x Shr 4)
				
				' index is 8 bit, so need to overflow
				If index > 255 Then 
					index = index - 255
				Else If index < 0 Then 
					index = 255 + index
				End
				
				xCanvas.SetImageDataPixel(imd, j, i, colors[index].r, colors[index].g, colors[index].b, 255)

				'SetColor colors[index].r, colors[index].g, colors[index].b
				'DrawLine j, i, j+1, i+1
				
				tpos1 = tpos1 + 5
				tpos2 = tpos2 + 3
			End
			tpos4 = tpos4 + 3
			tpos3 = tpos3 + 1
		End
		
		pos1 = pos1 + 9 
		pos3 = pos3 + 8 
		
		Cls 0, 0, 0 
		
		xCanvas.DrawImageData imd, 0, 0
	End
	
End

Function Main() 
	New Plasma
End
