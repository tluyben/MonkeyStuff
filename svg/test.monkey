Import svg

Global svgTest:Image = DrawSVG("<svg><ellipse cx=~q240~q cy=~q100~q rx=~q220~q ry=~q30~q style=~qfill:purple~q/><ellipse cx=~q220~q cy=~q70~q rx=~q190~q ry=~q20~q style=~qfill:lime~q/><ellipse cx=~q210~q cy=~q45~q rx=~q170~q ry=~q15~q style=~qfill:yellow~q/></svg>", 0,0, 500, 200)

Global svgSheep:Image = DrawSVG("data/Sheep_Head_clip_art.svg", 0, 0, 150, 200)

Class SvgTest Extends App
	Method OnCreate()
		SetUpdateRate 1
	End
	Method OnRender()
		DrawImage(svgTest, 10, 10)
		DrawImage(svgSheep, 10, 250)
	End
	
End 

Function Main() 
	New SvgTest()
End 