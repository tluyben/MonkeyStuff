/*
 * This generator uses a definition file to generate an interpreter for Monkey which works
 * with the simple language
 * 
 * By T. Luyben (tycho@e-lab.nl), BSD license 
 * 
 * TODO: make it pluggable for other languages, its a bit but not really
 */

import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.commons.io.FileUtils;


public class Generator {
	
	public String monkeyTypeConvert(String type) {
		// monkey types have capitals as first letter
		type = type.substring(0, 1).toUpperCase() + type.substring(1);
		
		return type;
	}
	
	public String monkeyFixName(String name) {
		name = name.replace('-', '_');
		return name;
	}
	
	protected Map<String, Object> assocToMap(Node n) {
		if (n == null || n.value == null || !n.value.equals("assoc")) {
			return null;
		}
		// this must be ordered! 
		LinkedHashMap<String, Object> result = new LinkedHashMap<String, Object>(); 
		for(Iterator<Node> it = n.kids.iterator(); it.hasNext();) {
			Node key = it.next(); 
			Node val = it.next(); 
			if (val.value.equals("assoc")) 
				result.put(key.value, assocToMap(val));
			else 
				result.put(key.value, val.value);
		}
		return result;
	}
	
	public String generate(Node ast, String type) throws Exception {
		String _native = "";
		Node n = null;
		for (Iterator<Node> it = ast.kids.iterator(); it.hasNext();) {
			n = it.next();	
			
			if (!n.value.equals("def")) {
				throw new Exception("Only def toplevel allowed!");
			}
			
			String name = n.kids.get(0).value; 
			if (type.equals("monkey")) {
				name = monkeyFixName(name);
			}
			_native += "Function ___"+name; 
			
			n = n.kids.get(1);
			
			// handle output
			Map<String, Object> _out = assocToMap(n.findChild("output", true));
			if (_out != null) { // out is defined or standard (Int)
				// we expect only 1 return argument; it doesn't support anything else yet 
				String _type = (String)_out.get(_out.keySet().iterator().next()); 
				if (type.equals("monkey"))
					_type = monkeyTypeConvert(_type);
				_native+=":"+_type;
			}
			_native+="(";
			
			Map<String, Object> _in = assocToMap(n.findChild("input", true));
			int count = 0;
			if (_in != null) {
				Iterator<String> it1 = _in.keySet().iterator();
				for (;it1.hasNext();) {
					String _name = it1.next();
					String _type = (String)_in.get(_name);
					if (type.equals("monkey"))
						_type = monkeyTypeConvert(_type);
					if (count > 0)
						_native +=",";
					_native+=_name+":"+_type;
					count ++;
				}
			
			}
			
			_native+=")\n";
			
			String code = n.findChild(type, true).value;
			code = code.substring(1, code.length()-1);
			_native += code;
			
			_native+="\nEnd\n";
		}
		return _native; 
	}
	
	public static void main(String[] args) {
		if (args.length < 1) {
			System.out.println("Usage: java -jar InterpreterGenerator.jar FILE.defs > corecommands.monkey");
			System.exit(-1);
		}
		
		String defs = null;
		try {
			defs = FileUtils.readFileToString(new File(args[0]));
		} catch (IOException e) {
			System.out.println("Does this file exist?");
			e.printStackTrace();
		}
		if (defs == null) {
			System.exit(-1);
		}
		
		Parser parser = new Parser(defs);
		parser.parse();
		try {
			System.out.println(new Generator().generate(parser.parseTree, "monkey"));
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
