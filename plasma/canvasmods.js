var GCanvas, GCanvasRC;

function initRenderContext(id)
{
	var GCanvas = document.getElementById(id);
	GCanvasRC = GCanvas.getContext("2d");
	
	return GCanvasRC;
}

function setFillGradient(grad)
{
	GCanvasRC.fillStyle = grad;
}

function setFillPattern(patt)
{
	GCanvasRC.fillStyle = patt;
}

function setStrokeGradient(grad)
{
	GCanvasRC.strokeStyle = grad;
}

function setStrokePattern(patt)
{
	GCanvasRC.strokeStyle = patt;
}

function loadHTMLImage(url)
{
	var img = new Image();
	img.src = url;

	return img;
}
