#rem

canvaswrapper.monkey

-----------------------------------------------------------------------------
---------------------------- Extended HTML5 Canvas Functionality ------------
-----------------------------------------------------------------------------

PURPOSE: Provide extended HTML5 canvas functionality, including canvas text, 
'stroke', lines, shadows, pixel manipulation, textured polygons etc.

DATE: November 2011

LICENSE: Public Domain

VERSION: 0.1

NOTES:

	Coded in Monkey Pro V48
	Performance and feature-support will be browser- and platform- dependent.
	** See the examples for usage! **
	** See the 'relevant standands' documents for certain parameter specifics! **

RELEVANT STANDARDS:
	<a href="http://dev.w3.org/html5/2dcontext/" target="_blank">http://dev.w3.org/html5/2dcontext/</a>
	<a href="http://dev.w3.org/csswg/css3-color/" target="_blank">http://dev.w3.org/csswg/css3-color/</a>
	<a href="http://www.w3.org/TR/css3-fonts/" target="_blank">http://www.w3.org/TR/css3-fonts/</a>

#end

Strict

#if TARGET<>"html5"
#error "The canvaswrapper module is only functional with the html5 target."
#end

Import "canvasmods.js"

Extern

'%% HTML5 DOM class wrappers (partial) %%

Class HTMLCanvasElement

	Field width:Int
	Field height:Int

	Method getContext:Object(contextId:String)
	Method getContext:Object(contextId:String, arg0:Object)	
	Method getContext:Object(contextId:String, arg0:Object, arg1:Object)	

End

Class HTMLImageElement

	Field width:Int
	Field height:Int
	
	Field complete:Bool
	
End

Class CanvasRenderingContext2D

	Field canvas:HTMLCanvasElement
	
	Field globalAlpha:Float
	Field globalCompositeOperation:String
	
	Field strokeStyle:String
	Field fillStyle:String

	Field lineWidth:Float
	Field lineCap:String
	Field lineJoin:String
	Field miterLimit:Float	
	
	Field shadowOffsetX:Float
	Field shadowOffsetY:Float
	Field shadowBlur:Float
	Field shadowColor:String
	
	Field font:String
	Field textAlign:String
	Field textBaseline:String
	
	Method save:Void()
	Method restore:Void()
	
	Method scale:Void(x:Float, y:Float)
	Method rotate:Void(angle:Float)
	Method translate:Void(x:Float, y:Float)
	Method transform:Void(m11:Float, m12:Float, m21:Float, m22:Float, dx:Float, dy:Float)
	Method setTransform:Void(m11:Float, m12:Float, m21:Float, m22:Float, dx:Float, dy:Float)
	
	Method drawImage:Void(image:Object, dx:Float, dy:Float)
	Method drawImage:Void(image:Object, dx:Float, dy:Float, dw:Float, dh:Float)
	Method drawImage:Void(image:Object, sx:Float, sy:Float, sw:Float, sh:Float, dx:Float, dy:Float, dw:Float, dh:Float)	

	Method createLinearGradient:CanvasGradient(x0:Float, y0:Float, x1:Float, y1:Float)
	Method createRadialGradient:CanvasGradient(x0:Float, y0:Float, r0:Float, x1:Float, y1:Float, r1:Float)
	Method createPattern:CanvasPattern(image:HTMLImageElement, repetition:String)

	Method beginPath:Void()
	Method closePath:Void()
	Method fill:Void()
	Method stroke:Void()
	Method clip:Void()
	Method moveTo:Void(x:Float, y:Float)
	Method lineTo:Void(x:Float, y:Float)
	Method quadraticCurveTo:Void(cpx:Float, cpy:Float, x:Float, y:Float)
	Method bezierCurveTo:Void(cp1x:Float, cp1y:Float, cp2x:Float, cp2y:Float, x:Float, y:Float)
	Method arcTo:Void(x1:Float, y1:Float, x2:Float, y2:Float, radius:Float)
	Method arc:Void(x:Float, y:Float, radius:Float, startAngle:Float, endAngle:Float, anticlockwise:Bool)
	Method rect:Void(x:Float, y:Float, w:Float, h:Float)
	Method isPointInPath:Bool(x:Float, y:Float)
	
	Method fillText:Void(text:String, x:Float, y:Float)
	Method fillText:Void(text:String, x:Float, y:Float, maxWidth:Float)
	Method strokeText:Void(text:String, x:Float, y:Float)
	Method strokeText:Void(text:String, x:Float, y:Float, maxWidth:Float)
	Method measureText:TextMetrics(text:String)
	
	Method clearRect:Void(x:Float, y:Float, w:Float, h:Float)
	Method fillRect:Void(x:Float, y:Float, w:Float, h:Float)
	Method strokeRect:Void(x:Float, y:Float, w:Float, h:Float)
	
	Method createImageData:ImageData(sw:Float, sh:Float)
	Method getImageData:ImageData(sx:Float, sy:Float, sw:Float, sh:Float)
	Method putImageData:Void(imagedata:ImageData, dx:Float, dy:Float)
	Method putImageData:Void(imagedata:ImageData, dx:Float, dy:Float, dirtyX:Float, dirtyY:Float, dirtyWidth:Float, dirtyHeight:Float)

End

Class CanvasGradient

	Method addColorStop:Void(offset:Float, color:String)

End

Class CanvasPattern

End

Class TextMetrics

	Field width:Float

End

Class ImageData

	Field width:Int
	Field height:Int
	Field data:Int[]	

End

Class CanvasPixelArray

	Field length:Int

End


'-- External convenience functions (mapped to canvasmods.js) --

Function initRenderContext:CanvasRenderingContext2D(id:String)
Function setFillGradient:Void(grad:CanvasGradient)
Function setStrokeGradient:Void(grad:CanvasGradient)
Function setFillPattern:Void(patt:CanvasPattern)
Function setStrokePattern:Void(patt:CanvasPattern)
Function loadHTMLImage:HTMLImageElement(url:String)


'*************************************************


Public


'&& This is the core, globally accessible variable for the canvas
Global xCanvas:CanvasExtras = New CanvasExtras()


'%% Convenience class %%

Class CanvasExtras

	'-- FIELDS
	
	Field renderContext:CanvasRenderingContext2D
	
	
	'-- CONTRUCTOR(S)
		
	Method New()

		'"GameCanvas" is the id that mojo assigns the HTML canvas element
		renderContext = initRenderContext("GameCanvas")		

	End


	'-- MISCELLANEOUS --
	
	Method Resize:Void(w:Int, h:Int)
	
		renderContext.canvas.width = w
		renderContext.canvas.height = h
	
	End


	'-- FONT, TEXT	

	Method SetFont:Void(fnt:String)
		'fnt: CSS font specifier
		
		renderContext.font = fnt
		
	End

	Method SetTextAlign:Void(al:String)
		'al: CSS alignment specifier (start, end, left, right, center)
	
		renderContext.textAlign = al
		
	End

	Method SetTextBaseline:Void(bl:String)
		'bl: CSS baseline specifier (top, hanging, middle, alphabetic, ideographic, bottom)
	
		renderContext.textBaseline = bl
		
	End
	
	Method GetTextWidth:Float(txt:String)
		'Return the length of txt in pixels

		Return renderContext.measureText(txt).width

	End

	Method DrawText:Void(txt:String, x:Float, y:Float, fill:Bool = True, stroke:Bool = True)
		'draw txt at pixel coordinate x, y, filled (fill) and/or stroked (stroke) 
	
		If fill Then renderContext.fillText txt, x, y
		If stroke Then renderContext.strokeText txt, x, y
	
	End

	Method DrawText:Void(txt:String, x:Float, y:Float, maxWidth:Float, fill:Bool = True, stroke:Bool = True)
		'draw txt at pixel coordinate x, y, compressed horizontally into maxWidth pixels,
		'filled (fill) and/or stroked (stroke)
				
		If fill Then renderContext.fillText txt, x, y, maxWidth
		If stroke Then renderContext.strokeText txt, x, y, maxWidth
	
	End


	'-- FILL STYLES

	Method SetFillStyle:Void(fs:String)
		'fs: HTML5 canvas style specifier

		renderContext.fillStyle = fs

	End

	Method SetFillColor:Void(r:Int, g:Int, b:Int)
		'r: red (0 to 255), g: green (0 to 255), b: blue (0 to 255)

		renderContext.fillStyle = xGetColorString(r, g, b)

	End

	Method SetFillColor:Void(r:Int, g:Int, b:Int, a:Float)
		'r: red (0 to 255), g: green (0 to 255), b: blue (0 to 255), a: alpha (0.0 to 1.0)
		
		renderContext.fillStyle = xGetColorString(r, g, b, a)

	End

	Method SetFillStyle:Void(cg:CanvasGradient)
		'cg: HTML5 canvasGradient object
		
		setFillGradient cg

	End

	Method SetFillStyle:Void(pat:CanvasPattern)
		'pat: HTML5 CanvasPattern object
		
		setFillPattern pat
	
	End


	'-- STROKE STYLES

	Method SetStrokeStyle:Void(ss:String)
		'ss: HTML5 canvas style specifier
		
		renderContext.strokeStyle = ss

	End

	Method SetStrokeColor:Void(r:Int, g:Int, b:Int)
		'r: red (0 to 255), g: green (0 to 255), b: blue (0 to 255)

		renderContext.strokeStyle = xGetColorString(r, g, b)

	End

	Method SetStrokeColor:Void(r:Int, g:Int, b:Int, a:Float)
		'r: red (0 to 255), g: green (0 to 255), b: blue (0 to 255), a: alpha (0.0 to 1.0)

		renderContext.strokeStyle = xGetColorString(r, g, b, a)

	End

	Method SetStrokeStyle:Void(cg:CanvasGradient)
		'cg: HTML5 canvasGradient object		

		setStrokeGradient cg

	End

	Method SetStrokeStyle:Void(pat:CanvasPattern)
		'pat: HTML5 CanvasPattern object
		
		setStrokePattern pat

	End


	'-- GRADIENTS, PATTERNS

	Method CreateLinearGradient:CanvasGradient(x0:Float, y0:Float, x1:Float, y1:Float)
		'return a HTML5 CanvasGradient object representing a linear line 
		'from coordinates x0, y0 to x1, y1
		
		Return renderContext.createLinearGradient(x0, y0, x1, y1)

	End

	Method CreateRadialGradient:CanvasGradient(x0:Float, y0:Float, r0:Float, x1:Float, y1:Float, r1:Float)
		'return a HTML5 CanvasGradient object representing a cone from
		'circle 1 centred x0, y0 with radius r0 to
		'circle 2 centred x1, y1 with radius r1

		Return renderContext.createRadialGradient(x0, y0, r0, x1, y1, r1)

	End

	Method CreatePattern:CanvasPattern(img:HTMLImageElement, rep:String)
		'return a HTML5 CanvasPattern object created from img (a HTMLImageElement object)
		'rep: HTML5 repetition specifier (repeat-x, repeat-y, repeat, no-repeat)

		Return renderContext.createPattern(img, rep)

	End


	'-- GEOMETRY
	
	Method DrawRect:Void(x:Float, y:Float ,w:Float, h:Float, fill:Bool = True, stroke:Bool = True)
		'Draw a rectangle at coordinate x, y with width w and height h, 
		'filled (fill) and/or stroked (stroke) with the current styles
	
		If fill Then renderContext.fillRect x, y, w, h
		If stroke Then renderContext.strokeRect x, y, w, h

	End
		
	Method DrawPoly:Void(coords:Float[], fill:Bool, stroke:Bool)
		'Draw a polygon along an array of vertices (coords) 
		'filled (fill) and/or stroked (stroke) with the current styles

		renderContext.beginPath()
		
	  	renderContext.moveTo(coords[0], coords[1])

		For Local i:Int = 0 Until coords.Length Step 2
	
	  		renderContext.lineTo(coords[i], coords[i + 1])
	  		If stroke Then renderContext.stroke()
	
		Next 
	
	 	renderContext.closePath()
	
		If fill Then renderContext.fill()
		
	End


	Method DrawLine:Void(x0:Float, y0:Float, x1:Float, y1:Float)
		'Draw a line from x1, y1 to x2, y2
			
		renderContext.beginPath()
	  	renderContext.moveTo(x0, y0)
		renderContext.lineTo(x1, y1)
		renderContext.stroke()
		renderContext.closePath()
	
	End


	'-- LINE STYLE
	' These methods set the line attributes of the canvas stroke.

	Method SetLine:Void(w:Float, cap:String, join:String, ml:Float)
		'w: width in pixels
		'cap: HTML5 cap style specifier (butt, round, square)
		'join: HTML5 line join style specifier (bevel, round, miter)
		'ml: miter limit
			
		renderContext.lineWidth = w
		renderContext.lineCap = cap
		renderContext.lineJoin = join
		renderContext.miterLimit = ml
	
	End

	Method SetLineWidth:Void(val:Float)
		'val: width in pixels

		renderContext.lineWidth = val

	End
	
	Method SetLineCap:Void(str:String)
		'str: HTML5 cap style specifier (butt, round, square)

		renderContext.lineCap = str

	End

	Method SetLineJoin:Void(str:String)
		'str: HTML5 line join style specifier (bevel, round, miter)
		
		renderContext.lineJoin = str

	End

	Function SetLineMiterLimit:Void(val:Float)
		'val: miter limit

		renderContext.miterLimit = val

	End

	
	'-- SHADOWS

	Method SetShadowColor:Void(str:String)
		'str: CSS color specifier

		renderContext.shadowColor = str	

	End


	Method SetShadowColor:Void(r:Int, g:Int, b:Int)
		'r: red (0 to 255), g: green (0 to 255), b: blue (0 to 255)

		renderContext.shadowColor = xGetColorString(r, g, b)	

	End


	Method SetShadowColor:Void(r:Int, g:Int, b:Int, a:Float)
		'r: red (0 to 255), g: green (0 to 255), b: blue (0 to 255), a: alpha (0.0 to 1.0)
		
		renderContext.shadowColor = xGetColorString(r, g, b, a)	

	End


	Method SetShadowOffsetX:Void(val:Float)
		'val: x offset value (pixels)

		renderContext.shadowOffsetX = val	

	End


	Method SetShadowOffsetY:Void(val:Float)
		'val: y offset value (pixels)

		renderContext.shadowOffsetY = val	

	End


	Method SetShadowBlur:Void(val:Float)
		'val: blur amount (0.0 to 1.0?)

		renderContext.shadowBlur = val	
	
	End


	'-- IMAGE DATA

	Method CreateImageData:ImageData(w:Int, h:Int)
		'return a new HTML5 canvas ImageData object of size w x h (width x height)
		
		Return renderContext.createImageData(w, h)
	
	End
	
	Method GetImageData:ImageData(x:Int, y:Int, w:Int, h:Int)
		'return a HTML5 canvas ImageData object from coordinate x, y
		'on the existing canvas and of size w x h (width x height)
		
		Return renderContext.getImageData(x, y, w, h)
	
	End

	Method DrawImageData:Void(imd:ImageData, x:Int, y:Int)
		'Draw a HTML5 ImageData object (imd) at coordinate x, y

		renderContext.putImageData imd, x, y
		
	End

	Method DrawImageData:Void(imd:ImageData, x:Int, y:Int, srcX:Int, srcY:Int, srcWidth:Int, srcHeight:Int)
		'Draw a portion (srcX, srcY to srcX + srcWidth, y + srcHeight) of an HTML5 ImageData object (imd) 
		'at coordinate x, y
		
		renderContext.putImageData imd, x - srcX, y - srcY, srcX, srcY, srcWidth, srcHeight
		
	End

	Method FillImageData:Void(imd:ImageData, r:Int, g:Int, b:Int, a:Int)
		'Fill a HTML5 ImageData object (imd) with a color and alpha component
		'r: red (0 to 255), g: green (0 to 255), b: blue (0 to 255), a: alpha (0 to 255)
	
		For Local i:Int = 0 Until imd.data.Length Step 4
			imd.data[i] = r
			imd.data[i+1] = g
			imd.data[i+2] = b
			imd.data[i+3] = a
		Next
	
	End	

	Method SetImageDataPixel:Void(imd:ImageData, x:Int, y:Int, r:Int, g:Int, b:Int, a:Int)
		'Set the pixel at coordinate x, y of a HTML5 ImageData object (imd) with a color and alpha component
		'r: red (0 to 255), g: green (0 to 255), b: blue (0 to 255), a: alpha (0 to 255)
		
		Local i:Int = ((y * 4) * imd.width) + (x * 4)

		imd.data[i] = r
		imd.data[i+1] = g
		imd.data[i+2] = b
		imd.data[i+3] = a
		
	End
		
	Method GetImageDataPixel:Int[](imd:ImageData, x:Int, y:Int)
		'return the color and alpha components at coordinate x, y of a HTML5 ImageData object (imd)
		'format: red, green, blue, alpha in a 4 element integer array
				
		Local i:Int = ((y * 4) * imd.width) + (x * 4)
		
		Return [imd.data[i], imd.data[i+1], imd.data[i+2], imd.data[i+3]]
		
	End 


End


'-- Internal convenience functions --

Function xGetColorString:String(r:Int, g:Int, b:Int)
	'return a CSS color specifier string
	'r: red (0 to 255), g: green (0 to 255), b: blue (0 to 255)

	Return ("rgb(" + String(r) + ", " + String(g) + ", " + String(b) + ")")

End

Function xGetColorString:String(r:Int, g:Int, b:Int, a:Float)
	'return a CSS color specifier string
	'r: red (0 to 255), g: green (0 to 255), b: blue (0 to 255), a: alpha (0.0 to 1.0)

	Return ("rgba(" + String(r) + ", " + String(g) + ", " + String(b) + ", " + String(a) + ")")

End
