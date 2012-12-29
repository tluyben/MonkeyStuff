/*
 * This generator uses a definition file to generate an interpreter for Monkey which works
 * with the simple language
 * 
 * By T. Luyben (tycho@e-lab.nl), BSD license 
 */
import java.awt.Point;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/*
 */

public class Parser {
	String code; 
	Node parseTree; 
	
	final public static int TYPE_FUNC = 1; 
	final public static int TYPE_LIT = 2 ;
	final public static int TYPE_VAR = 3; 

	public Parser() {
		
	}
	
	public Parser(String code) {
		this.code = code;
	}
	
	public void parse() {
		parse(this.code);
	}
	
	public String getCode() {
		return this.code;
	}
	
	public boolean equals(String code) {
		return this.code.equals(code);
	}
	
	
	
	public void parse(String code) {
		this.code = code;
		parseTree = new Node(); 
		parse(parseTree);
	}
	
	public void parse(Node n) {
		boolean instr = false; // are we in a string? 
		int incomment = 0; // are we in a comment, we took types in account /* ... */ and one-line ' ones ; easy
							// to extend
		String blit = ""; 
		
		for (int i=0;i<this.code.length();i++) {
			
			switch (this.code.charAt(i)) {  
				 /* comment code */
				 case '\'': // comment start if ... 
					if (!instr && incomment==0) { // ... we are not in a string or a comment yet
						incomment = 1; 
						continue;
					}
				 	break;
				 case '\n': 
					 if (incomment == 1) { // ' comments end at the end of line 
						 incomment = 0; 	
						 continue; 
					 }
					 break;
				 case '(': // this is a start of a new node if ...
					if (!instr && incomment == 0) { // ... we are not in a string atm 
						Node nn = new Node(n); 
						n.kids.add(nn);
						n = nn;
						continue;
					}
					break;
				case '"': // we are going into and out of a string if ...
					if (instr) { // if we are instr then we are getting out if ... 
						if (i>0 && this.code.charAt(i-1) != '\\') { // ... this is not a \"
							instr = false;
							
							if (blit.trim().length()>0) {
								blit += '"';
								n.kids.add(new Node(blit.trim(), n.parent, Parser.TYPE_LIT));
							}
							blit = "";
							continue;
						}
					} else if (incomment == 0){
						instr = true;
					}
					break;
					
				case ')': // we are going out of an expression if ... 
				case ' ': 
					if (!instr && incomment == 0) { // ... we are not in a string
						
						if (blit.trim().length() > 0) {
							if(n.value == null) {
								n.value = blit.trim();
								n.type = Parser.TYPE_FUNC;
							} else {
								n.kids.add(new Node(blit.trim(), n.parent, Parser.TYPE_LIT));
							}
						}
						
						blit = "";
						if (this.code.charAt(i) == ')') {
							n = n.parent; 
						}
						
						continue;
					}
					break;
			}
			
			if (incomment == 0) {
				blit += this.code.charAt(i);
				
			}
			
			
		}
	}
}
