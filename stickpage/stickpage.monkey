#rem
	Very simple game to play around with physics a bit 

By T. Luyben (tycho@e-lab.nl)
All code falls under BSD License
#End

Import mojo

Const SCREEN_WIDTH := 640
Const SCREEN_HEIGHT := 480
Const BACKGROUND_WIDTH := 77.0
Const BACKGROUND_HEIGHT := 62.0
Const BACKGROUND_SCALEX:Float = Float(SCREEN_WIDTH) / BACKGROUND_WIDTH
Const BACKGROUND_SCALEY:Float = Float(SCREEN_HEIGHT) / BACKGROUND_HEIGHT
Const DEG2RAD:Float = Float(PI) / 180
Const LAUNCHVEL := 15.0
Const G:Float = 0.5
Const ARLEN := 15


Class Game Extends App 
	Field archer:Archer
	Field spawner:Spawner
	Field bg:Image
	Field deadArcher : Bool = False 
	
	Method OnCreate() 
		archer = New Archer(Self)
		archer.OnCreate()
		spawner = New Spawner(archer)	
		spawner.OnCreate()	
		bg = LoadImage("bg.png")
		SetUpdateRate 60
		Seed = Millisecs()
	End
	
	Method OnRender() 
		DrawImage(bg, 0,0, 0,BACKGROUND_SCALEX,BACKGROUND_SCALEY)
		If Not deadArcher Then 
			archer.OnRender()
			spawner.OnRender()
			
		Else 
			Local s:String = "Game Over"
			DrawText s, SCREEN_WIDTH/2 - (s.Length*8)/2, SCREEN_HEIGHT/2 - 4
		End 
 
	End
	
	Method OnUpdate()
		archer.OnUpdate()
	End
	
	Method dead() 
		deadArcher = True
	End
End

Class Spawner 
	Field ourguys:FightersSpawner
	Field enemies:FightersSpawner
	Field round : Int = 1
	Field respawnCount : Int = 0
	Field respawnMax : Int = 20 ' Max amount of sec before a spawn
	Field respawn : Float = 0.1' Magic value which determines the spawn speed in further rounds (gets more difficult)
	Field ticker : Int = 0
	Field attacking : Bool = False
	Field beginAttack : Bool = False 
	Field spawnShowSpeed:Int = 10
	Field archer:Archer
	
	Method New(_archer:Archer) 
		archer = _archer
	End
	
	Method OnCreate() 
		ourguys = New FightersSpawner(LoadImage("archerbody.png"),LoadImage("archready.png"), LoadImage("archshoot.png"), True, Self)
		enemies = New FightersSpawner(LoadImage("archerbody.png"),LoadImage("archready.png"), LoadImage("archshoot.png"), False, Self)
	End
	
	Method OnRender()
		' show the spawner gauge
		If Not attacking And Not beginAttack Then 
		
				Local oc:Float[] = GetColor
				DrawText "Spawning: ", 10, 10
				DrawRect 90, 8, 200, 20
				SetColor 0,0,0
				DrawRect 90, 8, 10*respawnCount, 20
				SetColor oc[0], oc[1], oc[2] 
			
				ticker = ticker + 1
				If ticker > spawnShowSpeed Then  
					respawnCount = respawnCount + 1 
					ticker = 0	
				End 
				
				If respawnCount > respawnMax Then 
					respawnCount = 0
					beginAttack = True
				End
		
		End 

		' spawn the fighters
		If beginAttack Then 
			beginAttack = False
			ourguys.Spawn(5, round, enemies, archer)
			enemies.Spawn(10, round, ourguys, archer)
			attacking = True
		End
	
		If attacking Then
			ourguys.OnRender()
			enemies.OnRender()
		End
		
	End
	
	Method weAreDead()
		If Not enemies.getFighting() And Not ourguys.getFighting() Then 
			attacking = False
			round = round + 1
		End 
	End
	
	
End

Class FightersSpawner 
	Field still : Image
	Field walk : Image
	Field fight : Image 
	Field dir : Bool ' to the left = false, right = true
	Field dead : Spawner
	Field fighters:Fighter[]
	Field fighting:Bool = False
	Field roundInc:Int = 5 ' number of enemies to add per round
	Field count:Int
	
	Method New(_still:Image, _walk:Image, _fight:Image, _dir:Bool=False, _deadCallback:Spawner) 
		still = _still
		walk = _walk
		fight = _fight
		dir  = _dir	
		dead = _deadCallback
	End
	
	Method Spawn(count:Int, round:Int, opp: FightersSpawner, archer:Archer)
		' spawn fighters
		fighting = True
		' create fighters based on difficulty
		'count = roundInc * round
		Self.count = count
		fighters = New Fighter[count]
		
		For Local i=0 Until count

			fighters[i] = New Fighter(i+1, still, walk, fight, dir, Self, opp, archer);	
		End
		
	End
	
	Method OnRender()
		If fighting Then
			For Local i=0 Until fighters.Length
				If fighters[i] <> Null Then 
					fighters[i].OnRender()
				End
			End
		End
	End
	
	Method iAmDead(id:Int)
		fighters[id-1] = Null
		count = count - 1
		If count <= 0 Then 
			fighting = False
			dead.weAreDead()
		End
		
	End
	 
	Method getFighters:Fighter[]() 
		Return fighters
	End
	
	Method getFighting:Bool() 
		Return fighting
	End
End

Class Fighter 
	Field still : Image
	Field walk : Image
	Field fight : Image 
	Field dir : Bool ' to the left = false, right = true
	Field dead :FightersSpawner, enemies : FightersSpawner
	Field fighterid : Int
	Field speed : Int
	Field strength : Int
	Field moving : Int = False
	Field x :Int ,y:Int
	Field id : Int
	Field speedRange:Int = 20
	Field strengthRange:Int = 2
	Field ticker : Int = 0
	Field archer : Archer
	Field bumped : Bool = False
	
	Method New(_id : Int, _still:Image, _walk:Image, _fight:Image, _dir:Bool=False, _deadCallback: FightersSpawner, _enemies: FightersSpawner, _archer:Archer) 
		id = _id
		still = _still
		walk = _walk
		fight = _fight
		dir  = _dir	
		dead = _deadCallback
		enemies = _enemies
		archer = _archer
		OnCreate()
		
	End
	
	Method OnCreate() 
		If dir Then 
			x = -1 * math.Ceil(Rnd(500))
		Else 
			x = SCREEN_WIDTH + math.Ceil(Rnd(500))
		End
		y = SCREEN_HEIGHT - still.Height - 20
		speed = math.Ceil(Rnd(speedRange))+5
		strength = math.Ceil(Rnd(strengthRange))+1
		moving = True
	End
	
	Method setBumped(s:Bool) 
		bumped = s 
	End
	
	Method damage() 
		strength = strength - 1
	End
	
	Method OnRender() 
		If moving Then
			ticker = ticker + 1
			If Not bumped And ticker > 8 Then 
				ticker = 0
				If dir Then 
					x = x + speed
				Else
					x = x - speed
				End
			End 
			
			'If dir And 
			DrawImage still, x, y
			
			
			' check if any enemy is close
			Local fighters:Fighter[] = enemies.getFighters()
			setBumped(False)
			For Local i=0 Until fighters.Length
				If fighters[i]<>Null Then 
					Local ex = fighters[i].getX()
					Local mx = x
					If dir Then 
						mx = mx + still.Width
					Else 
						ex = ex + still.Width
					End
					
					If math.Abs(mx-ex) < 10 Then 
						setBumped(True)
						fighters[i].setBumped(True)
						damage() 
						fighters[i].damage()
					End
				End
				
			End
			
			' check if we are bumping into the archer
			If Not dir Then 
				If math.Abs(x-archer.getX()) < 10 Then 
					setBumped(True)
					damage()
					archer.damage()
				End
			End
			
			If Not dir Then 
				Local coords:Int[] = archer.getCoords()
				Local ax = coords[0] + ARLEN
				Local ay = coords[1]
				If ax > x And ax < x + still.Width And ay > y And ay < y + still.Height Then 
					strength = 0
				End
			End
			
			If dir Then 
				If x > SCREEN_WIDTH Then 
					strength = 0 
				End
			Else 
				If x < 0 Then
					strength = 0
				End
			End
			
			If strength <= 0 Then 
				moving = False
				dead.iAmDead(id)
			End
		End
		
	End
	
	Method getX() 
		Return x
	End
	
End

Class Archer 	
	Field archerbody:Image
	Field archready:Image
	Field archshoot:Image
	Field dirX : Float
	Field dirY : Float
	Field wasTouching : Bool 
	Field shooting : Bool
	Field lastAngle : Float
	Field v0x : Float
	Field v0y : Float
	Field ticker : Int
	Field px : Int
	Field py : Int
	Field velocity : Int
	Field strength : Int = 5
	Field game : Game 
	Field posX : Int = 40 
	Field posY : Int = 20
	
	' needed to check if there is a fight with this dude
	Method getX()
		Return posX + archerbody.Width	
	End
	
	Method damage() 
		strength = strength - 1
	End 
	
	Method New(_game:Game) 
		game = _game
	End
	
	Method OnCreate()
		archerbody = LoadImage("archerbody.png")
		archready = LoadImage("archready.png")
		archshoot = LoadImage("archshoot.png")
		ticker = 0
		velocity = 0
		
	End
	
	Method OnRender() 
		
		If strength <= 0 Then 
			game.dead()
			Return 
		End
		
	
		'Local posX = 40;
		'Local posY = 20; 
		
		DrawImage(archerbody, posX, SCREEN_HEIGHT - archerbody.Height - posY)
		
		Local y = SCREEN_HEIGHT - archerbody.Height - (posY+10)
		Local adj = y - dirY
		Local opp = dirX - posX - archerbody.Width / 2 ' middle of the body
		Local ang = ATan2(opp,adj)
		
		If ang < 0 Then
			ang = ang + 360
		End
		
		Local x = posX-4

		Local dx = archready.Width/2
		Local dy = archready.Height/2	
		
		ticker = ticker + 1 
		
		If Not shooting Then 
			lastAngle = ang
			px = x + dx
			py = y + dy 
			v0x = (velocity/2) * Cos(90-ang)
			v0y = (velocity/2) * Sin(90-ang)
			
			Local oc:Float[] = GetColor
			
			DrawRect x-10, y-50, 15, 40
			SetColor 0,0,0
			DrawRect x-10, y-10-velocity, 15, velocity
			SetColor oc[0], oc[1], oc[2] 
			
			If ticker > 2 And wasTouching Then 
				velocity = velocity + 2
				ticker = 0
			End
			
			If velocity > 40 Then 
				velocity = 40
			End
			
		End 		
				
		PushMatrix
			Translate x+dx, y+dy
			Rotate 360-ang
			DrawImage archready, -1*dx, -1*dy 
		PopMatrix
		
		
		If shooting Then 

			If ticker > 0 Then 
				px = px + v0x 
				py = py - v0y 
				v0y = v0y - G
				ticker = 0
			End 

			Local dir = 1
			If lastAngle > 180 Then 
				dir = -1
			End	
			
			Local oc:Float[] = GetColor
			SetColor 0, 0, 0
			DrawLine px, py, px + ARLEN, py - dir*v0y
			SetColor oc[0], oc[1], oc[2] 

			If px > SCREEN_WIDTH Or px < 0 Then
				shooting = False
			End
			
			If py > SCREEN_HEIGHT Or py < 0 Then
				shooting = False
			End
			
			If Not shooting Then
				velocity = 0
			End
		End
		
	End
	
	Method getCoords:Int[]() 
		Return [px, py]

	End
	
	Method OnUpdate()
		Local touching = False
		' Check touch
		If Not shooting Then 
			For Local i=0 Until 32
				If TouchDown( i )
					wasTouching = True
					touching = True
					dirX = TouchX(i)
					dirY = TouchY(i)
				Endif
			Next
		End
		
		' Shoot
		If wasTouching And Not touching Then
			wasTouching = False
			shooting = True	
		End
		
		
	End
End

Function Main ()
	New Game
End
