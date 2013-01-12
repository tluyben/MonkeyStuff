Import mojo
Import mojo.graphicsdevice

#If TARGET<>"html5" 
#Error "The mojo module is not available on the ${TARGET} target"
#End

#If TARGET="html5"

	Import "native/svg.js"

	Extern
		' drawSVGMonkey(s, x, y, w, h, app)
		Function DrawSVGMonkey:Surface(s:String, x: Float, y: Float, w: Float, h: Float, img:Image = Null) = "drawSVGMonkey"

#End 

Public 

Function DrawSVG:Image(s:String, x:Float, y:Float, w:Float, h:Float, img:Image = Null)
	Local surface:Surface = DrawSVGMonkey(s, x, y, w, h, img)
	If img <> Null 
		Return img
	Else
		Return (New Image).Init( surface, 1, Image.DefaultFlags )
	End 
End 