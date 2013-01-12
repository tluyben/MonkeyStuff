SVG function for Monkey. 

TODO: 
- add other targets

Installation: 

copy the directory svg to your Monkey modules directory

Usage: 

See test.monkey

To enable .svg file loading from the test.data (and others) directory, first make a build 

test.build

and open the 

CONFIG.MONKEY 

file. 

Add

BINARY_FILES="*.bin|*.dat|*.svg"

to it, save it and build again. Now the .svg loading works. 