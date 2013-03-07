Import mojo
Import diddy

Global gameScreen:GameScreen
Global gameOverScreen:GameOverScreen

Class Ball
	Field position:Vector2D
	Field radius:Int = 10
	Field angle:Float 
	Field velocity:Int=10
	Field direction:Vector2D
	
	Method New() 
		angle = Rnd(45) + 45
		If Rnd(10) > 5 angle = angle + 180
		position = New Vector2D(SCREEN_WIDTH2 - radius/2, SCREEN_HEIGHT2 - radius/2)
		CalcDirection
	End 
	
	Method CalcDirection()
		direction = New Vector2D(velocity*Sin(angle), velocity*Cos(angle))
	End 	
	
	Method Collide:Bool(bat:Bat) 
		If RectsOverlap(position.x-radius/2, position.y-radius/2, radius, radius,bat.position.x, bat.position.y, bat.size.x,  bat.size.y)
			
			angle = 360-angle  
			CalcDirection

			position.x = position.x - bat.margin * ((bat.position.x - SCREEN_WIDTH2)/Abs(bat.position.x - SCREEN_WIDTH2)) 

			Return True
		End 
		
		Return False 
	End 
	
	Method Update()
		position.Add(direction)
		
		If (position.y - radius/2 < 0) Or (position.y + radius/2 > SCREEN_HEIGHT)
			angle = 180-angle 
			CalcDirection()
		End 
		

	End 
	
	Method Died:Int()
		If position.x < 0 
			Return 0
		End 
		If position.x > SCREEN_WIDTH 
			Return 1
		End 
		
		Return -1
	End 
	
	Method Draw()
		SetColor 255,255,255
		
		DrawCircle position.x, position.y, radius
	End 
End 

Class Bat 
	Field position:Vector2D
	Field size:Vector2D
	Field margin:=10
	Field velocity:=10
	Field score:=0
	Field down:=False 
	Field touchCoor:Float 
	
	Method New(pos:Int=0)
		size = New Vector2D(10, SCREEN_HEIGHT/6)
		Local x:=margin
		Local y:=SCREEN_HEIGHT2 - (size.y / 2)
		If pos = 1 
			x = SCREEN_WIDTH - (size.x + margin)
		End 
		
		position = New Vector2D(x,y)
	End 
	
	Method Input() 
		If KeyDown(KEY_DOWN) = 1
			position.y = position.y + velocity 
			
		End 
		If KeyDown(KEY_UP) =1 
			position.y = position.y - velocity
			
		End 	
	
		If TouchDown(0)
			If Not down 
				touchCoor = position.y - MouseY 
				down = True 
			End 
			position.y = touchCoor + MouseY
		Else 	
			down = False 
		End 
		OutOfBounds
	End 
	
	Method OutOfBounds()
		If position.y <= 0 position.y = 0 
		If position.y + size.y >= SCREEN_HEIGHT position.y = SCREEN_HEIGHT - size.y
	
	End 
	
	Method AI(ball:Ball) 
		position.y = position.y + velocity*Cos(ball.angle)
		OutOfBounds
	End 
	
	Method Draw() 
		SetColor 255,255,255
		DrawRect(position.x, position.y, size.x, size.y)
		
		DrawText Int(score), SCREEN_WIDTH2 + TextWidth(Int(score)) * ((position.x - SCREEN_WIDTH2)/Abs(position.x - SCREEN_WIDTH2)), 10 
	End 
End 

Class GameScreen Extends Screen
	Field left:Bat, right:Bat
	Field ball:Ball 
	Field maxScore = 5
	
	Method Init()
		left = New Bat(0)
		right = New Bat(1)
		ball = New Ball 
	End 
	
	Method Start:Void() 
		Init()
	End 
	
	Method Update:Void()
		left.Input
		right.AI(ball)
		
		If ball.Collide(left) 
		
		End 
		
		If ball.Collide(right) 
		
		End 
		
		Local died := ball.Died
		If died = 0 ' right won 
			right.score = right.score + 1
		Else If died = 1 ' left won 
			left.score = left.score + 1 
		End 
		If left.score > maxScore Or right.score > maxScore 
			FadeToScreen(gameOverScreen)
		End 
		If died>=0 ball = New Ball
		
		ball.Update
	End 
	
	Method Render:Void()
		Cls 0,0,0
		
		left.Draw()
		right.Draw()
		ball.Draw()		
	End 
End 

Class GameOverScreen Extends Screen
	
	
	
	Method Start:Void() 
		
	End 
	
	Method Update:Void()
		If MouseHit() Or KeyHit(KEY_SPACE) Or TouchHit()
			gameScreen.Init
			FadeToScreen(gameScreen)
		End 
	End 
	
	Method Render:Void()
		Cls 0,0,0
		
		SetColor 255,255,255
		Local s:="Game Over - "
		If gameScreen.left.score > gameScreen.right.score 
			s = s + "YOU WON!"
		Else 
			s = s + "I WON!" 
		End 
		DrawText s, SCREEN_WIDTH2-TextWidth(s)/2, SCREEN_HEIGHT2 
		s = "Tap screen or left mouse button to continue"
		DrawText s, SCREEN_WIDTH2-TextWidth(s)/2, SCREEN_HEIGHT2 + 20
	End 
End 

Class PongApp Extends DiddyApp

	Method Create:Void() 
		SetGraphics(1024, 768)
		SetScreenSize(1024,768)
		drawFPSOn = True 
		gameScreen = New GameScreen
		gameOverScreen = New GameOverScreen
		Start(gameScreen)
	End 

End 

Function Main() 
	New PongApp
End 