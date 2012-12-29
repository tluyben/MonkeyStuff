#rem

mojostate.monkey

PURPOSE:	Provide the ability to save and restore mojo.graphics state 
			when used in conjunction with the HTML5 canvas wrapper.

#end

Strict

Import mojo.graphics
Import canvaswrapper

Global xMojoState:MojoState = New MojoState(xCanvas.renderContext)


Class MojoState


	Field renderContext:CanvasRenderingContext2D

	'Might need to add to this as mojo evolves.
	Field mojoAlpha:Float
	Field mojoCompositeOperation:String
	Field mojoFillStyle:String
	Field mojoStrokeStyle:String
	Field mojoLineWidth:Float
	Field mojoLineCap:String
	Field mojoLineJoin:String
	Field mojoLineMiterLimit:Float
	Field mojoShadowColor:String
	Field mojoShadowOffsetX:Float
	Field mojoShadowOffsetY:Float
	Field mojoShadowBlur:Float

	Field mojoMatrix:Float[]


	Method New(rc:CanvasRenderingContext2D)
	
		renderContext = rc
	
	End

	
	Method Save:Void()
	
		mojoAlpha = renderContext.globalAlpha
		mojoCompositeOperation = renderContext.globalCompositeOperation
		mojoFillStyle = renderContext.fillStyle
		mojoStrokeStyle = renderContext.strokeStyle
		mojoLineWidth = renderContext.lineWidth
		mojoLineCap = renderContext.lineCap
		mojoLineJoin = renderContext.lineJoin
		mojoLineMiterLimit = renderContext.miterLimit
		mojoShadowColor = renderContext.shadowColor
		mojoShadowOffsetX = renderContext.shadowOffsetX
		mojoShadowOffsetY = renderContext.shadowOffsetY
		mojoShadowBlur = renderContext.shadowBlur

		mojoMatrix = GetMatrix()
		
	End
	
	
	Method Restore:Void()
	
		renderContext.globalAlpha = mojoAlpha
		renderContext.globalCompositeOperation = mojoCompositeOperation
		renderContext.fillStyle = mojoFillStyle
		renderContext.strokeStyle = mojoStrokeStyle
		renderContext.lineWidth = mojoLineWidth
		renderContext.lineCap = mojoLineCap
		renderContext.lineJoin = mojoLineJoin
		renderContext.miterLimit = mojoLineMiterLimit
		renderContext.shadowColor = mojoShadowColor
		renderContext.shadowOffsetX = mojoShadowOffsetX
		renderContext.shadowOffsetY = mojoShadowOffsetY
		renderContext.shadowBlur = mojoShadowBlur
	
		SetMatrix mojoMatrix
		ApplyMatrix

	End
	
	
	Method ApplyMatrix:Void()

		Local arr:Float[] = GetMatrix()
		renderContext.setTransform arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]

	End


End

