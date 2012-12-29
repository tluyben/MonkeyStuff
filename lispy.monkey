#rem 

Very simple lispy (syntax And code wise) parser in the Monkey programming language.

Usage: 

		Local parser:=New Parser()
		parser.Parse("(x (y (z a b)))")
		Print parser.parseTree.ToString
		
TODO: ")" And " " are almost identical but Monkey does Not support double Case statements like: 

Case ")"
Case " " 
... code

TODO: Monkey String indexes str[0] Return character codes, Not characters, that's why I use str[0..1] to get a char back. That can be done better? 

By T. Luyben (tycho@e-lab.nl)
All code falls under BSD License

#End 

Import mojo

' this is needed to create the ast by the parser
Class Node 
	Field parent:Node
	Field kids:List<Node> = New List<Node>()
	Field value:String = ""
	Field type:Int '1 = function, 2 is literal, 3 is variable 
	
	Method New() 
	
	End 

	Method New(value:String, parent:Node, type:Int) 
		Self.value = value
		Self.parent = parent
		Self.type = type
	End 
	Method New(value:String, type:Int) 
		Self.value = value
		Self.type = type
	End
		
	Method New(parent:Node) 
		Self.parent = parent
	End
	
	Method ToString:String()
		Return ToString("")
	End 	
	
	' Pretty printing
	Method ToString:String(depth:String) 
		Local s:String
		If value.Length > 0 		
			s = s + depth + " " + value + " (type="+type+")~n"
		End 
		Local _kids:= kids.ObjectEnumerator
	
   		While _kids.HasNext()
        	Local ne:=_kids.NextObject()
        	s=s+ne.ToString(depth+"-")
    	Wend
    	Return s
		
	End 
			
End 

Class Parser 
	Field code:String
	Field parseTree:Node
	Const TYPE_FUNC = 1
	Const TYPE_LIT = 2
	Const TYPE_VAR = 3 

	Method New() 
	
	End 
	
	Method New(code:String) 
		Self.code = code
	End 
	
	Method Parse()
	
	End 
	
	Method Parse(code:String) 
		Self.code = code
		parseTree = New Node()
		Parse(parseTree)
	End 
	

	Method Parse(n:Node)
		Local instr:Bool = False 
		Local incomment:Int = 0 
		Local blit:String = ""
		
		For Local i:Int = 0 To Self.code.Length - 1
			Local c:String = Self.code[i..i+1]

			Select c
				Case "'" ' comment
					If Not instr And incomment = 0 
						incomment = 1
						Continue 
					End 
				Case "~n" ' end of line kills a comment 
					If incomment = 1
						incomment = 0 
						Continue
					End 
				Case "(" ' expression start if not in a string or comment
					If Not instr And incomment = 0 
						Local nn:= New Node(n)
						n.kids.AddLast(nn)
						n = nn
						Continue 
					End 
				Case "~q" ' string start if not in a string, string end if we are
					If instr 
						If i>0 And Self.code[i-1..i] <> "\"
							instr = False
							If blit.Trim().Length() > 0
								blit = blit + "~q"
								n.kids.AddLast(New Node(blit.Trim(), n.parent, TYPE_LIT))
							End 
							blit = ""
							Continue 
						End 
					Else If incomment = 0 
						instr = True 
					End 
				Case ")" ' expression end
					If Not instr And incomment = 0 
						If blit.Trim().Length() > 0 
							If n.value.Length = 0 
								n.value = blit.Trim()
								n.type = TYPE_FUNC
							Else 
								n.kids.AddLast(New Node(blit.Trim(), n.parent, TYPE_LIT))
							End 
						End 
						blit = ""
						n = n.parent
						Continue 
					End					
				Case " " ' space which means another literal
					If Not instr And incomment = 0 
						If blit.Trim().Length() > 0 
							If n.value.Length = 0 
								n.value = blit.Trim()
								n.type = TYPE_FUNC
							Else 
								n.kids.AddLast(New Node(blit.Trim(), n.parent, TYPE_LIT))
							End 
						End 
						blit = ""
						Continue 
					End 					
				
			End 
			If incomment = 0 
				blit = blit + c
			End 
					
		End
			
	End 
End 

