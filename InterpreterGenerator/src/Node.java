/*
 * This generator uses a definition file to generate an interpreter for Monkey which works
 * with the simple language
 * 
 * By T. Luyben (tycho@e-lab.nl), BSD license 
 */
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;


public class Node {
		Node parent;
		List<Node> kids = new ArrayList<Node>();
		String value = null;
		int type; // 1 = function, 2 is literal, 3 is variable (but we don't actually KNOW that here :) 
		
		public Node() {
			
		}
		
		public Node(String value, int type) {
			this();
			this.value = value;
		}
	
		public Node(Node parent) {
			this();
			this.parent = parent;
		}
		
		public Node(String value, Node parent, int type) {
			this.value = value;
			this.parent = parent;
			this.type = type;
		}
		
		public Node findChild(String value) {
			return findChild(value, false);
		}
		
		public Node findChild(String value, boolean sibling) {
			Node n = null; 
			for(Iterator<Node> it = kids.iterator(); it.hasNext(); ) {
				n = (Node)it.next();
				if (n.value != null && n.value.equals(value)) {
					if (!sibling) {
						return n;
					} else {
						return (Node)it.next();
					}
				}
			}
			return null;
		}
		
		public String toString() {
			
			return toString("");
		}
		public String toString(String depth) {
			String s= "";
			if (this.value != null) 
				  s+= depth + " " + this.value+" (type="+this.type+")\n";
			Iterator<Node> it = this.kids.iterator();
			while (it.hasNext()) {
				Node ne = it.next();
				//if (ne.value.length()>0) 
				s+=ne.toString(depth + "-");
			}
			return s;
		}
		
		// this is difficult :) we need the DEEPEST, not just any... 
		private int travUp(Node n) {
			if (n.parent == null) return 0;
			return 1+travUp(n.parent);
		}
		
		
		public String toExprString() {
			return toExprString(true);
		}
		public String toExprString(boolean layout) {
			
			String s = "";
			if (this.type==Parser.TYPE_FUNC) {
				// find out where you are to make formatting better :) 
				int loc = travUp(this);
				
				// do some padding etc for the visual effect
				if (layout && loc > 1) {
					for (;loc>0;loc--) s+=" ";
					s+="<- ";
				}
				
				s+= "(";
			}
			s+=this.value;
			Iterator<Node> it = this.kids.iterator();
			while (it.hasNext()) {
				Node ne = it.next();
				s += " " + ne.toExprString(false);
			}		
			if (this.type==Parser.TYPE_FUNC) {
				s += ")";
			}
			return s; 
		}
		
	}