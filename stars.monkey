#rem
	Simple starfield in Monkey


By T. Luyben (tycho@e-lab.nl)
All code falls under BSD License

#End

Import mojo

Const NUMBER_OF_STARS  = 1020 
Const SCREEN_WIDTH = 640
Const SCREEN_HEIGHT = 480 
Const DO_RESIZE = True 

Class Star 
	Public Field xpos:Float, ypos:Float
	Public Field zpos, speed
	Public Field color 
	Public Field size
End

Class Color 
	Public Field r,g,b
	Method New(r,g,b) 
		Self.r = r
		Self.g = g
		Self.b = b
	End
End


Class Stars Extends App
	Field i 
	Field stars:Star[NUMBER_OF_STARS]
	Field colors:Color[256]
	Field centerx, centery, tempx, tempy
	
	Method OnCreate() 
		SetUpdateRate 60
		
		colors[0] = New Color(0,0,0)
		For Local i=0 Until 255
			colors[255-i] = New Color(i,i,i)
		End
		
		For Local i=0 Until NUMBER_OF_STARS
			stars[i] = InitStar(i)
		End
	
		centerx = SCREEN_WIDTH Shr 1
		centery = SCREEN_HEIGHT Shr 1
		
		SetUpdateRate 60

	End
	
	Method InitStar:Star(i) 
		Local star:Star = New Star()
		
		star.xpos = -10 + (20.0 * (math.Rnd(65535)/65536));
		star.ypos = -10 + (20.0 * (math.Rnd(65535)/65536));
		
		star.xpos = star.xpos * 3072.0
		star.ypos = star.ypos * 3072.0
		
		star.zpos = i
		star.speed = 2+(2.0 * (math.Rnd(65535)/65536))
		
		star.color = i Shr 2
		
		star.size = 2
		
		Return star
	End
	
	Method CalcSize(zpos) 
		Local n = NUMBER_OF_STARS / 4
		
		Return (3 - zpos / n) * 1
	End
	
	
	Method OnRender() 
		Cls 0,0,0 
		
		For Local i = 0 Until NUMBER_OF_STARS
		
			stars[i].zpos -= stars[i].speed
			
			If stars[i].zpos <= 0 
				stars[i] = InitStar(i+1)
			End
			
			tempx = (stars[i].xpos / stars[i].zpos) + centerx
			tempy = (stars[i].ypos / stars[i].zpos) + centery
			
			If tempx < 0 Or tempx > SCREEN_WIDTH -1 Or tempy<0 Or tempy>SCREEN_HEIGHT-1 Then 
				stars[i] = InitStar(i+1)
				Continue 
			End 
			
			If DO_RESIZE Then 
				stars[i].size = CalcSize(stars[i].zpos)
			End 
		
			SetColor colors[stars[i].color].r, colors[stars[i].color].g, colors[stars[i].color].b
			DrawCircle tempx, tempy, stars[i].size
		End
		
	End
	
	
End

Function Main ()
	New Stars
End
