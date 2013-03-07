
//Change this to true for a stretchy canvas!
//
var RESIZEABLE_CANVAS=false;

//Start us up!
//
window.onload=function( e ){

	if( RESIZEABLE_CANVAS ){
		window.onresize=function( e ){
			var canvas=document.getElementById( "GameCanvas" );

			//This vs window.innerWidth, which apparently doesn't account for scrollbar?
			var width=document.body.clientWidth;
			
			//This vs document.body.clientHeight, which does weird things - document seems to 'grow'...perhaps canvas resize pushing page down?
			var height=window.innerHeight;			

			canvas.width=width;
			canvas.height=height;
		}
		window.onresize( null );
	}
	
	game_canvas=document.getElementById( "GameCanvas" );
	
	game_console=document.getElementById( "GameConsole" );

	try{
	
		bbInit();
		bbMain();
		
		if( game_runner!=null ) game_runner();
		
	}catch( err ){
	
		alertError( err );
	}
}

var game_canvas;
var game_console;
var game_runner;

//${CONFIG_BEGIN}
CFG_BINARY_FILES="*.bin|*.dat";
CFG_CD="";
CFG_CONFIG="release";
CFG_HOST="macos";
CFG_IMAGE_FILES="*.png|*.jpg";
CFG_LANG="js";
CFG_MODPATH=".;/Users/tycholuyben/Dropbox/Work/ZombieHerd/Pong;/Applications/MonkeyPro66/modules";
CFG_MOJO_AUTO_SUSPEND_ENABLED="0";
CFG_MUSIC_FILES="*.wav|*.ogg|*.mp3|*.m4a";
CFG_OPENGL_GLES20_ENABLED="0";
CFG_REFLECTION_FILTER="diddy.exception";
CFG_SAFEMODE="0";
CFG_SOUND_FILES="*.wav|*.ogg|*.mp3|*.m4a";
CFG_TARGET="html5";
CFG_TEXT_FILES="*.txt|*.xml|*.json";
CFG_TRANSDIR="";
//${CONFIG_END}

//${METADATA_BEGIN}
var META_DATA="[mojo_font.png];type=image/png;width=864;height=13;\n";
//${METADATA_END}

function getMetaData( path,key ){

	if( path.toLowerCase().indexOf("monkey://data/")!=0 ) return "";
	path=path.slice(14);

	var i=META_DATA.indexOf( "["+path+"]" );
	if( i==-1 ) return "";
	i+=path.length+2;

	var e=META_DATA.indexOf( "\n",i );
	if( e==-1 ) e=META_DATA.length;

	i=META_DATA.indexOf( ";"+key+"=",i )
	if( i==-1 || i>=e ) return "";
	i+=key.length+2;

	e=META_DATA.indexOf( ";",i );
	if( e==-1 ) return "";

	return META_DATA.slice( i,e );
}

function fixDataPath( path ){
	if( path.toLowerCase().indexOf("monkey://data/")==0 ) return "data/"+path.slice(14);
	return path;
}

function openXMLHttpRequest( req,path,async ){

	path=fixDataPath( path );
	
	var xhr=new XMLHttpRequest;
	xhr.open( req,path,async );
	return xhr;
}

function loadArrayBuffer( path ){

	var xhr=openXMLHttpRequest( "GET",path,false );

	if( xhr.overrideMimeType ) xhr.overrideMimeType( "text/plain; charset=x-user-defined" );

	xhr.send( null );
	
	if( xhr.status!=200 && xhr.status!=0 ) return null;

	var r=xhr.responseText;
	var buf=new ArrayBuffer( r.length );

	for( var i=0;i<r.length;++i ){
		this.dataView.setInt8( i,r.charCodeAt(i) );
	}
	return buf;
}

function loadString( path ){
	path=fixDataPath( path );
	var xhr=new XMLHttpRequest();
	xhr.open( "GET",path,false );
	xhr.send( null );
	if( (xhr.status==200) || (xhr.status==0) ) return xhr.responseText;
	return "";
}

function loadImage( path,onloadfun ){

	var ty=getMetaData( path,"type" );
	if( ty.indexOf( "image/" )!=0 ) return null;

	var image=new Image();
	
	image.meta_width=parseInt( getMetaData( path,"width" ) );
	image.meta_height=parseInt( getMetaData( path,"height" ) );
	image.onload=onloadfun;
	image.src="data/"+path.slice(14);
	
	return image;
}

function loadAudio( path ){

	path=fixDataPath( path );
	
	var audio=new Audio( path );
	return audio;
}

//${TRANSCODE_BEGIN}

// Javascript Monkey runtime.
//
// Placed into the public domain 24/02/2011.
// No warranty implied; use at your own risk.

//***** JavaScript Runtime *****

var D2R=0.017453292519943295;
var R2D=57.29577951308232;

var err_info="";
var err_stack=[];

var dbg_index=0;

function push_err(){
	err_stack.push( err_info );
}

function pop_err(){
	err_info=err_stack.pop();
}

function stackTrace(){
	if( !err_info.length ) return "";
	var str=err_info+"\n";
	for( var i=err_stack.length-1;i>0;--i ){
		str+=err_stack[i]+"\n";
	}
	return str;
}

function print( str ){
	if( game_console ){
		game_console.value+=str+"\n";
		game_console.scrollTop = game_console.scrollHeight - game_console.clientHeight;
	}
	if( window.console!=undefined ){
		window.console.log( str );
	}
	return 0;
}

function alertError( err ){
	if( typeof(err)=="string" && err=="" ) return;
	alert( "Monkey Runtime Error : "+err.toString()+"\n\n"+stackTrace() );
}

function error( err ){
	throw err;
}

function debugLog( str ){
	print( str );
}

function debugStop(){
	error( "STOP" );
}

function dbg_object( obj ){
	if( obj ) return obj;
	error( "Null object access" );
}

function dbg_array( arr,index ){
	if( index<0 || index>=arr.length ) error( "Array index out of range" );
	dbg_index=index;
	return arr;
}

function new_bool_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]=false;
	return arr;
}

function new_number_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]=0;
	return arr;
}

function new_string_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]='';
	return arr;
}

function new_array_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]=[];
	return arr;
}

function new_object_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]=null;
	return arr;
}

function resize_bool_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]=false;
	return arr;
}

function resize_number_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]=0;
	return arr;
}

function resize_string_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]="";
	return arr;
}

function resize_array_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]=[];
	return arr;
}

function resize_object_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]=null;
	return arr;
}

function string_compare( lhs,rhs ){
	var n=Math.min( lhs.length,rhs.length ),i,t;
	for( i=0;i<n;++i ){
		t=lhs.charCodeAt(i)-rhs.charCodeAt(i);
		if( t ) return t;
	}
	return lhs.length-rhs.length;
}

function string_replace( str,find,rep ){	//no unregex replace all?!?
	var i=0;
	for(;;){
		i=str.indexOf( find,i );
		if( i==-1 ) return str;
		str=str.substring( 0,i )+rep+str.substring( i+find.length );
		i+=rep.length;
	}
}

function string_trim( str ){
	var i=0,i2=str.length;
	while( i<i2 && str.charCodeAt(i)<=32 ) i+=1;
	while( i2>i && str.charCodeAt(i2-1)<=32 ) i2-=1;
	return str.slice( i,i2 );
}

function string_startswith( str,substr ){
	return substr.length<=str.length && str.slice(0,substr.length)==substr;
}

function string_endswith( str,substr ){
	return substr.length<=str.length && str.slice(str.length-substr.length,str.length)==substr;
}

function string_tochars( str ){
	var arr=new Array( str.length );
	for( var i=0;i<str.length;++i ) arr[i]=str.charCodeAt(i);
	return arr;
}

function string_fromchars( chars ){
	var str="",i;
	for( i=0;i<chars.length;++i ){
		str+=String.fromCharCode( chars[i] );
	}
	return str;
}

function object_downcast( obj,clas ){
	if( obj instanceof clas ) return obj;
	return null;
}

function object_implements( obj,iface ){
	if( obj && obj.implments && obj.implments[iface] ) return obj;
	return null;
}

function extend_class( clas ){
	var tmp=function(){};
	tmp.prototype=clas.prototype;
	return new tmp;
}

function ThrowableObject(){
}

ThrowableObject.prototype.toString=function(){ 
	return "Uncaught Monkey Exception"; 
}

// Note: Firefox doesn't support DataView, so we have to kludge...
//
// This means pokes/peeks must be naturally aligned, but data has to be in WebGL anyway so that's OK for now.
//
function BBDataBuffer(){
	this.arrayBuffer=null;
	this.dataView=null;
	this.length=0;
}

BBDataBuffer.prototype._Init=function( buffer ){
	this.arrayBuffer=buffer;
	this.dataView=new DataView( buffer );
	this.length=buffer.byteLength;
}

BBDataBuffer.prototype._New=function( length ){
	if( this.arrayBuffer ) return false;
	
	var buf=new ArrayBuffer( length );
	if( !buf ) return false;
	
	this._Init( buf );
	return true;
}

BBDataBuffer.prototype._Load=function( path ){
	if( this.arrayBuffer ) return false;
	
	var buf=loadArrayBuffer( path );
	if( !buf ) return false;
	
	_Init( buf );
	return true;
}

BBDataBuffer.prototype.Length=function(){
	return this.length;
}

BBDataBuffer.prototype.Discard=function(){
	if( this.arrayBuffer ){
		this.arrayBuffer=null;
		this.dataView=null;
		this.length=0;
	}
}

BBDataBuffer.prototype.PokeByte=function( addr,value ){
	this.dataView.setInt8( addr,value );
}

BBDataBuffer.prototype.PokeShort=function( addr,value ){
	this.dataView.setInt16( addr,value );	
}

BBDataBuffer.prototype.PokeInt=function( addr,value ){
	this.dataView.setInt32( addr,value );	
}

BBDataBuffer.prototype.PokeFloat=function( addr,value ){
	this.dataView.setFloat32( addr,value );	
}

BBDataBuffer.prototype.PeekByte=function( addr ){
	return this.dataView.getInt8( addr );
}

BBDataBuffer.prototype.PeekShort=function( addr ){
	return this.dataView.getInt16( addr );
}

BBDataBuffer.prototype.PeekInt=function( addr ){
	return this.dataView.getInt32( addr );
}

BBDataBuffer.prototype.PeekFloat=function( addr ){
	return this.dataView.getFloat32( addr );
}

// HTML5 mojo runtime.
//
// Copyright 2011 Mark Sibly, all rights reserved.
// No warranty implied; use at your own risk.

var gl=null;	//global WebGL context - a bit rude!

KEY_LMB=1;
KEY_RMB=2;
KEY_MMB=3;
KEY_TOUCH0=0x180;

function eatEvent( e ){
	if( e.stopPropagation ){
		e.stopPropagation();
		e.preventDefault();
	}else{
		e.cancelBubble=true;
		e.returnValue=false;
	}
}

function keyToChar( key ){
	switch( key ){
	case 8:
	case 9:
	case 13:
	case 27:
	case 32:
		return key;
	case 33:
	case 34:
	case 35:
	case 36:
	case 37:
	case 38:
	case 39:
	case 40:
	case 45:
		return key | 0x10000;
	case 46:
		return 127;
	}
	return 0;
}

//***** gxtkApp class *****

function gxtkApp(){

	if( CFG_OPENGL_GLES20_ENABLED=="1" ){
		this.gl=game_canvas.getContext( "webgl" );
		if( !this.gl ) this.gl=game_canvas.getContext( "experimental-webgl" );
	}else{
		this.gl=null;
	}

	this.graphics=new gxtkGraphics( this,game_canvas );
	this.input=new gxtkInput( this );
	this.audio=new gxtkAudio( this );

	this.loading=0;
	this.maxloading=0;

	this.updateRate=0;
	this.startMillis=(new Date).getTime();
	
	this.dead=false;
	this.suspended=false;
	
	var app=this;
	var canvas=game_canvas;
	
	function gxtkMain(){
	
		var input=app.input;
	
		canvas.onkeydown=function( e ){
			input.OnKeyDown( e.keyCode );
			var chr=keyToChar( e.keyCode );
			if( chr ) input.PutChar( chr );
			if( e.keyCode<48 || (e.keyCode>111 && e.keyCode<122) ) eatEvent( e );
		}

		canvas.onkeyup=function( e ){
			input.OnKeyUp( e.keyCode );
		}

		canvas.onkeypress=function( e ){
			if( e.charCode ){
				input.PutChar( e.charCode );
			}else if( e.which ){
				input.PutChar( e.which );
			}
		}

		canvas.onmousedown=function( e ){
			switch( e.button ){
			case 0:input.OnKeyDown( KEY_LMB );break;
			case 1:input.OnKeyDown( KEY_MMB );break;
			case 2:input.OnKeyDown( KEY_RMB );break;
			}
			eatEvent( e );
		}
		
		canvas.onmouseup=function( e ){
			switch( e.button ){
			case 0:input.OnKeyUp( KEY_LMB );break;
			case 1:input.OnKeyUp( KEY_MMB );break;
			case 2:input.OnKeyUp( KEY_RMB );break;
			}
			eatEvent( e );
		}
		
		canvas.onmouseout=function( e ){
			input.OnKeyUp( KEY_LMB );
			input.OnKeyUp( KEY_MMB );
			input.OnKeyUp( KEY_RMB );
			eatEvent( e );
		}

		canvas.onmousemove=function( e ){
			var x=e.clientX+document.body.scrollLeft;
			var y=e.clientY+document.body.scrollTop;
			var c=canvas;
			while( c ){
				x-=c.offsetLeft;
				y-=c.offsetTop;
				c=c.offsetParent;
			}
			input.OnMouseMove( x,y );
			eatEvent( e );
		}

		canvas.onfocus=function( e ){
			if( CFG_MOJO_AUTO_SUSPEND_ENABLED=="1" ){
				app.InvokeOnResume();
			}
		}
		
		canvas.onblur=function( e ){
			if( CFG_MOJO_AUTO_SUSPEND_ENABLED=="1" ){
				app.InvokeOnSuspend();
			}
		}
		
		canvas.ontouchstart=function( e ){
			for( var i=0;i<e.changedTouches.length;++i ){
				var touch=e.changedTouches[i];
				var x=touch.pageX;
				var y=touch.pageY;
				var c=canvas;
				while( c ){
					x-=c.offsetLeft;
					y-=c.offsetTop;
					c=c.offsetParent;
				}
				input.OnTouchStart( touch.identifier,x,y );
			}
			eatEvent( e );
		}
		
		canvas.ontouchmove=function( e ){
			for( var i=0;i<e.changedTouches.length;++i ){
				var touch=e.changedTouches[i];
				var x=touch.pageX;
				var y=touch.pageY;
				var c=canvas;
				while( c ){
					x-=c.offsetLeft;
					y-=c.offsetTop;
					c=c.offsetParent;
				}
				input.OnTouchMove( touch.identifier,x,y );
			}
			eatEvent( e );
		}
		
		canvas.ontouchend=function( e ){
			for( var i=0;i<e.changedTouches.length;++i ){
				input.OnTouchEnd( e.changedTouches[i].identifier );
			}
			eatEvent( e );
		}
		
		window.ondevicemotion=function( e ){
			var tx=e.accelerationIncludingGravity.x/9.81;
			var ty=e.accelerationIncludingGravity.y/9.81;
			var tz=e.accelerationIncludingGravity.z/9.81;
			var x,y;
			switch( window.orientation ){
			case   0:x=+tx;y=-ty;break;
			case 180:x=-tx;y=+ty;break;
			case  90:x=-ty;y=-tx;break;
			case -90:x=+ty;y=+tx;break;
			}
			input.OnDeviceMotion( x,y,tz );
			eatEvent( e );
		}

		canvas.focus();

		app.InvokeOnCreate();
		app.InvokeOnRender();
	}

	game_runner=gxtkMain;
}

var timerSeq=0;

gxtkApp.prototype.SetFrameRate=function( fps ){

	var seq=++timerSeq;
	
	if( !fps ) return;
	
	var app=this;
	var updatePeriod=1000.0/fps;
	var nextUpdate=(new Date).getTime()+updatePeriod;
	
	function timeElapsed(){
		if( seq!=timerSeq ) return;

		var time;		
		var updates=0;

		for(;;){
			nextUpdate+=updatePeriod;

			app.InvokeOnUpdate();
			if( seq!=timerSeq ) return;
			
			if( nextUpdate>(new Date).getTime() ) break;
			
			if( ++updates==7 ){
				nextUpdate=(new Date).getTime();
				break;
			}
		}
		app.InvokeOnRender();
		if( seq!=timerSeq ) return;
			
		var delay=nextUpdate-(new Date).getTime();
		setTimeout( timeElapsed,delay>0 ? delay : 0 );
	}
	
	setTimeout( timeElapsed,updatePeriod );
}

gxtkApp.prototype.IncLoading=function(){
	++this.loading;
	if( this.loading>this.maxloading ) this.maxloading=this.loading;
	if( this.loading==1 ) this.SetFrameRate( 0 );
}

gxtkApp.prototype.DecLoading=function(){
	--this.loading;
	if( this.loading!=0 ) return;
	this.maxloading=0;
	this.SetFrameRate( this.updateRate );
}

gxtkApp.prototype.GetMetaData=function( path,key ){
	return getMetaData( path,key );
}

gxtkApp.prototype.Die=function( err ){
	this.dead=true;
	this.audio.OnSuspend();
	alertError( err );
}

gxtkApp.prototype.InvokeOnCreate=function(){
	if( this.dead ) return;
	
	try{
		gl=this.gl;
		this.OnCreate();
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

gxtkApp.prototype.InvokeOnUpdate=function(){
	if( this.dead || this.suspended || !this.updateRate || this.loading ) return;
	
	try{
		gl=this.gl;
		this.input.BeginUpdate();
		this.OnUpdate();		
		this.input.EndUpdate();
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

gxtkApp.prototype.InvokeOnSuspend=function(){
	if( this.dead || this.suspended ) return;
	
	try{
		gl=this.gl;
		this.suspended=true;
		this.OnSuspend();
		this.audio.OnSuspend();
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

gxtkApp.prototype.InvokeOnResume=function(){
	if( this.dead || !this.suspended ) return;
	
	try{
		gl=this.gl;
		this.audio.OnResume();
		this.OnResume();
		this.suspended=false;
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

gxtkApp.prototype.InvokeOnRender=function(){
	if( this.dead || this.suspended ) return;
	
	try{
		gl=this.gl;
		this.graphics.BeginRender();
		if( this.loading ){
			this.OnLoading();
		}else{
			this.OnRender();
		}
		this.graphics.EndRender();
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

//***** GXTK API *****

gxtkApp.prototype.GraphicsDevice=function(){
	return this.graphics;
}

gxtkApp.prototype.InputDevice=function(){
	return this.input;
}

gxtkApp.prototype.AudioDevice=function(){
	return this.audio;
}

gxtkApp.prototype.AppTitle=function(){
	return document.URL;
}

gxtkApp.prototype.LoadState=function(){
	var state=localStorage.getItem( ".mojostate@"+document.URL );
	if( state ) return state;
	return "";
}

gxtkApp.prototype.SaveState=function( state ){
	localStorage.setItem( ".mojostate@"+document.URL,state );
}

gxtkApp.prototype.LoadString=function( path ){
	return loadString( path );
}

gxtkApp.prototype.SetUpdateRate=function( fps ){
	this.updateRate=fps;
	
	if( !this.loading ) this.SetFrameRate( fps );
}

gxtkApp.prototype.MilliSecs=function(){
	return ((new Date).getTime()-this.startMillis)|0;
}

gxtkApp.prototype.Loading=function(){
	return this.loading;
}

gxtkApp.prototype.OnCreate=function(){
}

gxtkApp.prototype.OnUpdate=function(){
}

gxtkApp.prototype.OnSuspend=function(){
}

gxtkApp.prototype.OnResume=function(){
}

gxtkApp.prototype.OnRender=function(){
}

gxtkApp.prototype.OnLoading=function(){
}

//***** gxtkGraphics class *****

function gxtkGraphics( app,canvas ){
	this.app=app;
	this.canvas=canvas;
	this.gc=canvas.getContext( '2d' );
	this.tmpCanvas=null;
	this.r=255;
	this.b=255;
	this.g=255;
	this.white=true;
	this.color="rgb(255,255,255)"
	this.alpha=1;
	this.blend="source-over";
	this.ix=1;this.iy=0;
	this.jx=0;this.jy=1;
	this.tx=0;this.ty=0;
	this.tformed=false;
	this.scissorX=0;
	this.scissorY=0;
	this.scissorWidth=0;
	this.scissorHeight=0;
	this.clipped=false;
}

gxtkGraphics.prototype.BeginRender=function(){
	if( this.gc ) this.gc.save();
}

gxtkGraphics.prototype.EndRender=function(){
	if( this.gc ) this.gc.restore();
}

gxtkGraphics.prototype.Mode=function(){
	if( this.gc ) return 1;
	return 0;
}

gxtkGraphics.prototype.Width=function(){
	return this.canvas.width;
}

gxtkGraphics.prototype.Height=function(){
	return this.canvas.height;
}

gxtkGraphics.prototype.LoadSurface=function( path ){
	var app=this.app;
	
	function onloadfun(){
		app.DecLoading();
	}

	app.IncLoading();

	var image=loadImage( path,onloadfun );
	if( image ) return new gxtkSurface( image,this );

	app.DecLoading();
	return null;
}

gxtkGraphics.prototype.CreateSurface=function( width,height ){

	var canvas=document.createElement( 'canvas' );
	
	canvas.width=width;
	canvas.height=height;
	canvas.meta_width=width;
	canvas.meta_height=height;
	canvas.complete=true;
	
	var surface=new gxtkSurface( canvas,this );
	
	surface.gc=canvas.getContext( '2d' );
	
	return surface;
}

gxtkGraphics.prototype.SetAlpha=function( alpha ){
	this.alpha=alpha;
	this.gc.globalAlpha=alpha;
}

gxtkGraphics.prototype.SetColor=function( r,g,b ){
	this.r=r;
	this.g=g;
	this.b=b;
	this.white=(r==255 && g==255 && b==255);
	this.color="rgb("+(r|0)+","+(g|0)+","+(b|0)+")";
	this.gc.fillStyle=this.color;
	this.gc.strokeStyle=this.color;
}

gxtkGraphics.prototype.SetBlend=function( blend ){
	switch( blend ){
	case 1:
		this.blend="lighter";
		break;
	default:
		this.blend="source-over";
	}
	this.gc.globalCompositeOperation=this.blend;
}

gxtkGraphics.prototype.SetScissor=function( x,y,w,h ){
	this.scissorX=x;
	this.scissorY=y;
	this.scissorWidth=w;
	this.scissorHeight=h;
	this.clipped=(x!=0 || y!=0 || w!=this.canvas.width || h!=this.canvas.height);
	this.gc.restore();
	this.gc.save();
	if( this.clipped ){
		this.gc.beginPath();
		this.gc.rect( x,y,w,h );
		this.gc.clip();
		this.gc.closePath();
	}
	this.gc.fillStyle=this.color;
	this.gc.strokeStyle=this.color;
	if( this.tformed ) this.gc.setTransform( this.ix,this.iy,this.jx,this.jy,this.tx,this.ty );
}

gxtkGraphics.prototype.SetMatrix=function( ix,iy,jx,jy,tx,ty ){
	this.ix=ix;this.iy=iy;
	this.jx=jx;this.jy=jy;
	this.tx=tx;this.ty=ty;
	this.gc.setTransform( ix,iy,jx,jy,tx,ty );
	this.tformed=(ix!=1 || iy!=0 || jx!=0 || jy!=1 || tx!=0 || ty!=0);
}

gxtkGraphics.prototype.Cls=function( r,g,b ){
	if( this.tformed ) this.gc.setTransform( 1,0,0,1,0,0 );
	this.gc.fillStyle="rgb("+(r|0)+","+(g|0)+","+(b|0)+")";
	this.gc.globalAlpha=1;
	this.gc.globalCompositeOperation="source-over";
	this.gc.fillRect( 0,0,this.canvas.width,this.canvas.height );
	this.gc.fillStyle=this.color;
	this.gc.globalAlpha=this.alpha;
	this.gc.globalCompositeOperation=this.blend;
	if( this.tformed ) this.gc.setTransform( this.ix,this.iy,this.jx,this.jy,this.tx,this.ty );
}

gxtkGraphics.prototype.DrawPoint=function( x,y ){
	if( this.tformed ){
		var px=x;
		x=px * this.ix + y * this.jx + this.tx;
		y=px * this.iy + y * this.jy + this.ty;
		this.gc.setTransform( 1,0,0,1,0,0 );
		this.gc.fillRect( x,y,1,1 );
		this.gc.setTransform( this.ix,this.iy,this.jx,this.jy,this.tx,this.ty );
	}else{
		this.gc.fillRect( x,y,1,1 );
	}
}

gxtkGraphics.prototype.DrawRect=function( x,y,w,h ){
	if( w<0 ){ x+=w;w=-w; }
	if( h<0 ){ y+=h;h=-h; }
	if( w<=0 || h<=0 ) return;
	//
	this.gc.fillRect( x,y,w,h );
}

gxtkGraphics.prototype.DrawLine=function( x1,y1,x2,y2 ){
	if( this.tformed ){
		var x1_t=x1 * this.ix + y1 * this.jx + this.tx;
		var y1_t=x1 * this.iy + y1 * this.jy + this.ty;
		var x2_t=x2 * this.ix + y2 * this.jx + this.tx;
		var y2_t=x2 * this.iy + y2 * this.jy + this.ty;
		this.gc.setTransform( 1,0,0,1,0,0 );
	  	this.gc.beginPath();
	  	this.gc.moveTo( x1_t,y1_t );
	  	this.gc.lineTo( x2_t,y2_t );
	  	this.gc.stroke();
	  	this.gc.closePath();
		this.gc.setTransform( this.ix,this.iy,this.jx,this.jy,this.tx,this.ty );
	}else{
	  	this.gc.beginPath();
	  	this.gc.moveTo( x1,y1 );
	  	this.gc.lineTo( x2,y2 );
	  	this.gc.stroke();
	  	this.gc.closePath();
	}
}

gxtkGraphics.prototype.DrawOval=function( x,y,w,h ){
	if( w<0 ){ x+=w;w=-w; }
	if( h<0 ){ y+=h;h=-h; }
	if( w<=0 || h<=0 ) return;
	//
  	var w2=w/2,h2=h/2;
	this.gc.save();
	this.gc.translate( x+w2,y+h2 );
	this.gc.scale( w2,h2 );
  	this.gc.beginPath();
	this.gc.arc( 0,0,1,0,Math.PI*2,false );
	this.gc.fill();
  	this.gc.closePath();
	this.gc.restore();
}

gxtkGraphics.prototype.DrawPoly=function( verts ){
	if( verts.length<6 ) return;
	this.gc.beginPath();
	this.gc.moveTo( verts[0],verts[1] );
	for( var i=2;i<verts.length;i+=2 ){
		this.gc.lineTo( verts[i],verts[i+1] );
	}
	this.gc.fill();
	this.gc.closePath();
}

gxtkGraphics.prototype.DrawSurface=function( surface,x,y ){
	if( !surface.image.complete ) return;
	
	if( this.white ){
		this.gc.drawImage( surface.image,x,y );
		return;
	}
	
	this.DrawImageTinted( surface.image,x,y,0,0,surface.swidth,surface.sheight );
}

gxtkGraphics.prototype.DrawSurface2=function( surface,x,y,srcx,srcy,srcw,srch ){
	if( !surface.image.complete ) return;

	if( srcw<0 ){ srcx+=srcw;srcw=-srcw; }
	if( srch<0 ){ srcy+=srch;srch=-srch; }
	if( srcw<=0 || srch<=0 ) return;

	if( this.white ){
		this.gc.drawImage( surface.image,srcx,srcy,srcw,srch,x,y,srcw,srch );
		return;
	}
	
	this.DrawImageTinted( surface.image,x,y,srcx,srcy,srcw,srch  );
}

gxtkGraphics.prototype.DrawImageTinted=function( image,dx,dy,sx,sy,sw,sh ){

	if( !this.tmpCanvas ){
		this.tmpCanvas=document.createElement( "canvas" );
	}

	if( sw>this.tmpCanvas.width || sh>this.tmpCanvas.height ){
		this.tmpCanvas.width=Math.max( sw,this.tmpCanvas.width );
		this.tmpCanvas.height=Math.max( sh,this.tmpCanvas.height );
	}
	
	var tmpGC=this.tmpCanvas.getContext( "2d" );
	tmpGC.globalCompositeOperation="copy";
	
	tmpGC.drawImage( image,sx,sy,sw,sh,0,0,sw,sh );
	
	var imgData=tmpGC.getImageData( 0,0,sw,sh );
	
	var p=imgData.data,sz=sw*sh*4,i;
	
	for( i=0;i<sz;i+=4 ){
		p[i]=p[i]*this.r/255;
		p[i+1]=p[i+1]*this.g/255;
		p[i+2]=p[i+2]*this.b/255;
	}
	
	tmpGC.putImageData( imgData,0,0 );
	
	this.gc.drawImage( this.tmpCanvas,0,0,sw,sh,dx,dy,sw,sh );
}

gxtkGraphics.prototype.ReadPixels=function( pixels,x,y,width,height,offset,pitch ){

	var imgData=this.gc.getImageData( x,y,width,height );
	
	var p=imgData.data,i=0,j=offset,px,py;
	
	for( py=0;py<height;++py ){
		for( px=0;px<width;++px ){
			pixels[j++]=(p[i+3]<<24)|(p[i]<<16)|(p[i+1]<<8)|p[i+2];
			i+=4;
		}
		j+=pitch-width;
	}
}

gxtkGraphics.prototype.WritePixels2=function( surface,pixels,x,y,width,height,offset,pitch ){

	if( !surface.gc ){
		if( !surface.image.complete ) return;
		var canvas=document.createElement( "canvas" );
		canvas.width=surface.swidth;
		canvas.height=surface.sheight;
		surface.gc=canvas.getContext( "2d" );
		surface.gc.globalCompositeOperation="copy";
		surface.gc.drawImage( surface.image,0,0 );
		surface.image=canvas;
	}

	var imgData=surface.gc.createImageData( width,height );

	var p=imgData.data,i=0,j=offset,px,py,argb;
	
	for( py=0;py<height;++py ){
		for( px=0;px<width;++px ){
			argb=pixels[j++];
			p[i]=(argb>>16) & 0xff;
			p[i+1]=(argb>>8) & 0xff;
			p[i+2]=argb & 0xff;
			p[i+3]=(argb>>24) & 0xff;
			i+=4;
		}
		j+=pitch-width;
	}
	
	surface.gc.putImageData( imgData,x,y );
}

//***** gxtkSurface class *****

function gxtkSurface( image,graphics ){
	this.image=image;
	this.graphics=graphics;
	this.swidth=image.meta_width;
	this.sheight=image.meta_height;
}

//***** GXTK API *****

gxtkSurface.prototype.Discard=function(){
	if( this.image ){
		this.image=null;
	}
}

gxtkSurface.prototype.Width=function(){
	return this.swidth;
}

gxtkSurface.prototype.Height=function(){
	return this.sheight;
}

gxtkSurface.prototype.Loaded=function(){
	return this.image.complete;
}

gxtkSurface.prototype.OnUnsafeLoadComplete=function(){
	return true;
}

//***** Class gxtkInput *****

function gxtkInput( app ){
	this.app=app;
	this.keyStates=new Array( 512 );
	this.charQueue=new Array( 32 );
	this.charPut=0;
	this.charGet=0;
	this.mouseX=0;
	this.mouseY=0;
	this.joyX=0;
	this.joyY=0;
	this.joyZ=0;
	this.touchIds=new Array( 32 );
	this.touchXs=new Array( 32 );
	this.touchYs=new Array( 32 );
	this.accelX=0;
	this.accelY=0;
	this.accelZ=0;
	
	var i;
	
	for( i=0;i<512;++i ){
		this.keyStates[i]=0;
	}
	
	for( i=0;i<32;++i ){
		this.touchIds[i]=-1;
		this.touchXs[i]=0;
		this.touchYs[i]=0;
	}
}

gxtkInput.prototype.BeginUpdate=function(){
}

gxtkInput.prototype.EndUpdate=function(){
	for( var i=0;i<512;++i ){
		this.keyStates[i]&=0x100;
	}
	this.charGet=0;
	this.charPut=0;
}

gxtkInput.prototype.OnKeyDown=function( key ){
	if( (this.keyStates[key]&0x100)==0 ){
		this.keyStates[key]|=0x100;
		++this.keyStates[key];
		//
		if( key==KEY_LMB ){
			this.keyStates[KEY_TOUCH0]|=0x100;
			++this.keyStates[KEY_TOUCH0];
		}else if( key==KEY_TOUCH0 ){
			this.keyStates[KEY_LMB]|=0x100;
			++this.keyStates[KEY_LMB];
		}
		//
	}
}

gxtkInput.prototype.OnKeyUp=function( key ){
	this.keyStates[key]&=0xff;
	//
	if( key==KEY_LMB ){
		this.keyStates[KEY_TOUCH0]&=0xff;
	}else if( key==KEY_TOUCH0 ){
		this.keyStates[KEY_LMB]&=0xff;
	}
	//
}

gxtkInput.prototype.PutChar=function( chr ){
	if( this.charPut-this.charGet<32 ){
		this.charQueue[this.charPut & 31]=chr;
		this.charPut+=1;
	}
}

gxtkInput.prototype.OnMouseMove=function( x,y ){
	this.mouseX=x;
	this.mouseY=y;
	this.touchXs[0]=x;
	this.touchYs[0]=y;
}

gxtkInput.prototype.OnTouchStart=function( id,x,y ){
	for( var i=0;i<32;++i ){
		if( this.touchIds[i]==-1 ){
			this.touchIds[i]=id;
			this.touchXs[i]=x;
			this.touchYs[i]=y;
			this.OnKeyDown( KEY_TOUCH0+i );
			return;
		} 
	}
}

gxtkInput.prototype.OnTouchMove=function( id,x,y ){
	for( var i=0;i<32;++i ){
		if( this.touchIds[i]==id ){
			this.touchXs[i]=x;
			this.touchYs[i]=y;
			if( i==0 ){
				this.mouseX=x;
				this.mouseY=y;
			}
			return;
		}
	}
}

gxtkInput.prototype.OnTouchEnd=function( id ){
	for( var i=0;i<32;++i ){
		if( this.touchIds[i]==id ){
			this.touchIds[i]=-1;
			this.OnKeyUp( KEY_TOUCH0+i );
			return;
		}
	}
}

gxtkInput.prototype.OnDeviceMotion=function( x,y,z ){
	this.accelX=x;
	this.accelY=y;
	this.accelZ=z;
}

//***** GXTK API *****

gxtkInput.prototype.SetKeyboardEnabled=function( enabled ){
	return 0;
}

gxtkInput.prototype.KeyDown=function( key ){
	if( key>0 && key<512 ){
		return this.keyStates[key] >> 8;
	}
	return 0;
}

gxtkInput.prototype.KeyHit=function( key ){
	if( key>0 && key<512 ){
		return this.keyStates[key] & 0xff;
	}
	return 0;
}

gxtkInput.prototype.GetChar=function(){
	if( this.charPut!=this.charGet ){
		var chr=this.charQueue[this.charGet & 31];
		this.charGet+=1;
		return chr;
	}
	return 0;
}

gxtkInput.prototype.MouseX=function(){
	return this.mouseX;
}

gxtkInput.prototype.MouseY=function(){
	return this.mouseY;
}

gxtkInput.prototype.JoyX=function( index ){
	return this.joyX;
}

gxtkInput.prototype.JoyY=function( index ){
	return this.joyY;
}

gxtkInput.prototype.JoyZ=function( index ){
	return this.joyZ;
}

gxtkInput.prototype.TouchX=function( index ){
	return this.touchXs[index];
}

gxtkInput.prototype.TouchY=function( index ){
	return this.touchYs[index];
}

gxtkInput.prototype.AccelX=function(){
	return this.accelX;
}

gxtkInput.prototype.AccelY=function(){
	return this.accelY;
}

gxtkInput.prototype.AccelZ=function(){
	return this.accelZ;
}


//***** gxtkChannel class *****
function gxtkChannel(){
	this.sample=null;
	this.audio=null;
	this.volume=1;
	this.pan=0;
	this.rate=1;
	this.flags=0;
	this.state=0;
}

//***** gxtkAudio class *****
function gxtkAudio( app ){
	this.app=app;
	this.okay=typeof(Audio)!="undefined";
	this.nextchan=0;
	this.music=null;
	this.channels=new Array(33);
	for( var i=0;i<33;++i ){
		this.channels[i]=new gxtkChannel();
	}
}

gxtkAudio.prototype.OnSuspend=function(){
	var i;
	for( i=0;i<33;++i ){
		var chan=this.channels[i];
		if( chan.state==1 ) chan.audio.pause();
	}
}

gxtkAudio.prototype.OnResume=function(){
	var i;
	for( i=0;i<33;++i ){
		var chan=this.channels[i];
		if( chan.state==1 ) chan.audio.play();
	}
}

gxtkAudio.prototype.LoadSample=function( path ){
	var audio=loadAudio( path );
	if( !audio ) return null;
	return new gxtkSample( audio );
}

gxtkAudio.prototype.PlaySample=function( sample,channel,flags ){
	if( !this.okay ) return;

	var chan=this.channels[channel];

	if( chan.state!=0 ){
		chan.audio.pause();
		chan.state=0;
	}
	
	for( var i=0;i<33;++i ){
		var chan2=this.channels[i];
		if( chan2.state==1 && chan2.audio.ended && !chan2.audio.loop ) chan.state=0;
		if( chan2.state==0 && chan2.sample ){
			chan2.sample.FreeAudio( chan2.audio );
			chan2.sample=null;
			chan2.audio=null;
		}
	}

	var audio=sample.AllocAudio();
	if( !audio ) return;
	
	audio.loop=(flags&1)!=0;
	audio.volume=chan.volume;
	audio.play();

	chan.sample=sample;
	chan.audio=audio;
	chan.flags=flags;
	chan.state=1;
}

gxtkAudio.prototype.StopChannel=function( channel ){
	var chan=this.channels[channel];
	
	if( chan.state!=0 ){
		chan.audio.pause();
		chan.state=0;
	}
}

gxtkAudio.prototype.PauseChannel=function( channel ){
	var chan=this.channels[channel];
	
	if( chan.state==1 ){
		if( chan.audio.ended && !chan.audio.loop ){
			chan.state=0;
		}else{
			chan.audio.pause();
			chan.state=2;
		}
	}
}

gxtkAudio.prototype.ResumeChannel=function( channel ){
	var chan=this.channels[channel];
	
	if( chan.state==2 ){
		chan.audio.play();
		chan.state=1;
	}
}

gxtkAudio.prototype.ChannelState=function( channel ){
	var chan=this.channels[channel];
	if( chan.state==1 && chan.audio.ended && !chan.audio.loop ) chan.state=0;
	return chan.state;
}

gxtkAudio.prototype.SetVolume=function( channel,volume ){
	var chan=this.channels[channel];
	if( chan.state!=0 ) chan.audio.volume=volume;
	chan.volume=volume;
}

gxtkAudio.prototype.SetPan=function( channel,pan ){
	var chan=this.channels[channel];
	chan.pan=pan;
}

gxtkAudio.prototype.SetRate=function( channel,rate ){
	var chan=this.channels[channel];
	chan.rate=rate;
}

gxtkAudio.prototype.PlayMusic=function( path,flags ){
	this.StopMusic();
	
	this.music=this.LoadSample( path );
	if( !this.music ) return;
	
	this.PlaySample( this.music,32,flags );
}

gxtkAudio.prototype.StopMusic=function(){
	this.StopChannel( 32 );

	if( this.music ){
		this.music.Discard();
		this.music=null;
	}
}

gxtkAudio.prototype.PauseMusic=function(){
	this.PauseChannel( 32 );
}

gxtkAudio.prototype.ResumeMusic=function(){
	this.ResumeChannel( 32 );
}

gxtkAudio.prototype.MusicState=function(){
	return this.ChannelState( 32 );
}

gxtkAudio.prototype.SetMusicVolume=function( volume ){
	this.SetVolume( 32,volume );
}

//***** gxtkSample class *****

function gxtkSample( audio ){
	this.audio=audio;
	this.free=new Array();
	this.insts=new Array();
}

gxtkSample.prototype.FreeAudio=function( audio ){
	this.free.push( audio );
}

gxtkSample.prototype.AllocAudio=function(){
	var audio;
	while( this.free.length ){
		audio=this.free.pop();
		try{
			audio.currentTime=0;
			return audio;
		}catch( ex ){
			print( "AUDIO ERROR1!" );
		}
	}
	
	//Max out?
	if( this.insts.length==8 ) return null;
	
	audio=new Audio( this.audio.src );
	
	//yucky loop handler for firefox!
	//
	audio.addEventListener( 'ended',function(){
		if( this.loop ){
			try{
				this.currentTime=0;
				this.play();
			}catch( ex ){
				print( "AUDIO ERROR2!" );
			}
		}
	},false );

	this.insts.push( audio );
	return audio;
}

gxtkSample.prototype.Discard=function(){
}


function BBThread(){
	this.running=false;
}

BBThread.prototype.Start=function(){
	this.Run__UNSAFE__();
}

BBThread.prototype.IsRunning=function(){
	return this.running;
}

BBThread.prototype.Run__UNSAFE__=function(){
}

function BBAsyncImageLoaderThread(){
	BBThread.call(this);
}

BBAsyncImageLoaderThread.prototype=extend_class( BBThread );

BBAsyncImageLoaderThread.prototype.Start=function(){

	var thread=this;

	var image=new Image();
	
	image.onload=function( e ){
		image.meta_width=image.width;
		image.meta_height=image.height;
		thread._surface=new gxtkSurface( image,thread._device )
		thread.running=false;
	}
	
	image.onerror=function( e ){
		thread._surface=null;
		thread.running=false;
	}
	
	thread.running=true;
	
	image.src=fixDataPath( thread._path );
}


function BBAsyncSoundLoaderThread(){
	BBThread.call(this);
}

BBAsyncSoundLoaderThread.prototype=extend_class( BBThread );

BBAsyncSoundLoaderThread.prototype.Start=function(){
	this._sample=this._device.LoadSample( this._path );
}
var diddy = new Object();

var diddy_mouseWheelDelta = 0.0;

diddy.mouseZ = function() {
	var t = diddy_mouseWheelDelta;
	diddy_mouseWheelDelta = 0.0;
	return t;
}

diddy.mouseZInit = function() {
	var canvas=document.getElementById( "GameCanvas" );
	
	canvas.onmousewheel = function(e) {
		diddy_mouseWheelDelta += e.wheelDelta/120.0;
	}
}

diddy.systemMillisecs=function(){
	return new Date().getTime();
};

diddy.flushKeys=function(){
	for( var i = 0; i < 512; ++i )
	{
		bb_input_device.keyStates[i]=0;
	}
};

diddy.getUpdateRate=function(){
	return bb_app_device.updateRate;
};

diddy.showMouse=function()
{
	document.getElementById("GameCanvas").style.cursor='default';
}
diddy.setGraphics=function(w, h)
{
	var canvas=document.getElementById( "GameCanvas" );
	canvas.width  = w;
	canvas.height = h;
	//return window.innerHeight;
}
diddy.setMouse=function(x, y)
{
}
diddy.showKeyboard=function()
{
}
diddy.launchBrowser=function(address, windowName)
{
	window.open(address, windowName);
}
diddy.launchEmail=function(email, subject, text)
{
	location.href="mailto:"+email+"&subject="+subject+"&body="+text+"";
}

diddy.startVibrate=function(millisecs)
{
}
diddy.stopVibrate=function()
{
}

diddy.getDayOfMonth=function(){
	return new Date().getDate();
}

diddy.getDayOfWeek=function(){
	return new Date().getDay()+1;
}

diddy.getMonth=function(){
	return new Date().getMonth()+1;
}

diddy.getYear=function(){
	return new Date().getFullYear();
}

diddy.getHours=function(){
	return new Date().getHours();
}

diddy.getMinutes=function(){
	return new Date().getMinutes();
}

diddy.getSeconds=function(){
	return new Date().getSeconds();
}

diddy.getMilliSeconds=function(){
	return new Date().getMilliseconds();
}

diddy.startGps=function(){

}
diddy.getLatitiude=function(){
	return ""
}
diddy.getLongitude=function(){
	return ""
}
diddy.showAlertDialog=function(title, message)
{
}
diddy.getInputString=function()
{
	return "";
}
// Browser detect from http://www.quirksmode.org/js/detect.html
var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			string: navigator.userAgent,
			subString: "iPhone",
			identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};
BrowserDetect.init();

diddy.getBrowserName=function(){
	return BrowserDetect.browser;
};

diddy.getBrowserVersion=function(){
	return BrowserDetect.version;
};

diddy.getBrowserOS=function(){
	return BrowserDetect.OS;
};

diddy.getPixel=function(x, y){
	var tcanvas=document.getElementById("GameCanvas").getContext("2d")
	if (tcanvas==null)
		return 0;
	var img = tcanvas.getImageData(x, y, 1, 1); 
	var pix = img.data;
//	game_console.value = "alpha="+pix[3]+"\n"
	return (pix[3]<<24) | (pix[0]<<16) | (pix[1]<<8) | pix[2];
};

diddy.hideMouse=function()
{
	document.getElementById("GameCanvas").style.cursor= "url('data:image/cur;base64,AAACAAEAICAAAAAAAACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAgBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA55ZXBgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOeWVxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADnllcGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9////////////////////+////////f/////////8%3D'), auto";
};

diddy.seekMusic=function(timeMillis)
{
	if(bb_audio_device &&
		bb_audio_device.channels &&
		bb_audio_device.channels[32] &&
		bb_audio_device.channels[32].audio)
	{
		var audio = bb_audio_device.channels[32].audio;
		try {
			audio.currentTime = timeMillis/1000.0;
			return 1;
		} catch(e) {}
	}
	return 0;
};
function bb_exception_DiddyException(){
	ThrowableObject.call(this);
	this.f_message="";
	this.f_cause=null;
	this.f_type="";
	this.f_fullType="";
}
bb_exception_DiddyException.prototype=extend_class(ThrowableObject);
bb_exception_DiddyException.prototype.m_Message=function(){
	return this.f_message;
}
bb_exception_DiddyException.prototype.m_Message2=function(t_message){
	this.f_message=t_message;
}
bb_exception_DiddyException.prototype.m_Cause=function(){
	return this.f_cause;
}
bb_exception_DiddyException.prototype.m_Cause2=function(t_cause){
	if(t_cause==(this)){
		t_cause=null;
	}
	this.f_cause=t_cause;
}
bb_exception_DiddyException.prototype.m_Type=function(){
	return this.f_type;
}
bb_exception_DiddyException.prototype.m_FullType=function(){
	return this.f_fullType;
}
bb_exception_DiddyException.prototype.m_ToString=function(t_recurse){
	var t_rv=this.f_type+": "+this.f_message;
	if(t_recurse){
		var t_depth=10;
		var t_current=this.f_cause;
		while(((t_current)!=null) && t_depth>0){
			if((object_downcast((t_current),bb_exception_DiddyException))!=null){
				t_rv=t_rv+("\nCaused by "+this.f_type+": "+object_downcast((t_current),bb_exception_DiddyException).f_message);
				t_current=object_downcast((t_current),bb_exception_DiddyException).f_cause;
				t_depth-=1;
			}else{
				t_rv=t_rv+"\nCaused by a non-Diddy exception.";
				t_current=null;
			}
		}
	}
	return t_rv;
}
function bb_exception_DiddyException_new(t_message,t_cause){
	this.f_message=t_message;
	this.f_cause=t_cause;
	var t_ci=bb_reflection_GetClass2(this);
	if((t_ci)!=null){
		this.f_fullType=t_ci.m_Name();
	}else{
		this.f_fullType="diddy.exception.DiddyException";
	}
	if(this.f_fullType.indexOf(".")!=-1){
		this.f_type=this.f_fullType.slice(this.f_fullType.lastIndexOf(".")+1);
	}else{
		this.f_type=this.f_fullType;
	}
	return this;
}
function bb_reflection_ClassInfo(){
	Object.call(this);
	this.f__name="";
	this.f__attrs=0;
	this.f__sclass=null;
	this.f__ifaces=[];
	this.f__rconsts=[];
	this.f__consts=[];
	this.f__rfields=[];
	this.f__fields=[];
	this.f__rglobals=[];
	this.f__globals=[];
	this.f__rmethods=[];
	this.f__methods=[];
	this.f__rfunctions=[];
	this.f__functions=[];
	this.f__ctors=[];
}
bb_reflection_ClassInfo.prototype.m_Name=function(){
	return this.f__name;
}
function bb_reflection_ClassInfo_new(t_name,t_attrs,t_sclass,t_ifaces){
	this.f__name=t_name;
	this.f__attrs=t_attrs;
	this.f__sclass=t_sclass;
	this.f__ifaces=t_ifaces;
	return this;
}
function bb_reflection_ClassInfo_new2(){
	return this;
}
bb_reflection_ClassInfo.prototype.m_Init=function(){
	return 0;
}
bb_reflection_ClassInfo.prototype.m_InitR=function(){
	if((this.f__sclass)!=null){
		var t_consts=bb_stack_Stack_new2.call(new bb_stack_Stack,this.f__sclass.f__rconsts);
		var t_=this.f__consts;
		var t_2=0;
		while(t_2<t_.length){
			var t_t=t_[t_2];
			t_2=t_2+1;
			t_consts.m_Push(t_t);
		}
		this.f__rconsts=t_consts.m_ToArray();
		var t_fields=bb_stack_Stack2_new2.call(new bb_stack_Stack2,this.f__sclass.f__rfields);
		var t_3=this.f__fields;
		var t_4=0;
		while(t_4<t_3.length){
			var t_t2=t_3[t_4];
			t_4=t_4+1;
			t_fields.m_Push4(t_t2);
		}
		this.f__rfields=t_fields.m_ToArray();
		var t_globals=bb_stack_Stack3_new2.call(new bb_stack_Stack3,this.f__sclass.f__rglobals);
		var t_5=this.f__globals;
		var t_6=0;
		while(t_6<t_5.length){
			var t_t3=t_5[t_6];
			t_6=t_6+1;
			t_globals.m_Push7(t_t3);
		}
		this.f__rglobals=t_globals.m_ToArray();
		var t_methods=bb_stack_Stack4_new2.call(new bb_stack_Stack4,this.f__sclass.f__rmethods);
		var t_7=this.f__methods;
		var t_8=0;
		while(t_8<t_7.length){
			var t_t4=t_7[t_8];
			t_8=t_8+1;
			t_methods.m_Push10(t_t4);
		}
		this.f__rmethods=t_methods.m_ToArray();
		var t_functions=bb_stack_Stack5_new2.call(new bb_stack_Stack5,this.f__sclass.f__rfunctions);
		var t_9=this.f__functions;
		var t_10=0;
		while(t_10<t_9.length){
			var t_t5=t_9[t_10];
			t_10=t_10+1;
			t_functions.m_Push13(t_t5);
		}
		this.f__rfunctions=t_functions.m_ToArray();
	}else{
		this.f__rconsts=this.f__consts;
		this.f__rfields=this.f__fields;
		this.f__rglobals=this.f__globals;
		this.f__rmethods=this.f__methods;
		this.f__rfunctions=this.f__functions;
	}
	return 0;
}
function bb_map_Map(){
	Object.call(this);
	this.f_root=null;
}
function bb_map_Map_new(){
	return this;
}
bb_map_Map.prototype.m_Compare=function(t_lhs,t_rhs){
}
bb_map_Map.prototype.m_RotateLeft=function(t_node){
	var t_child=t_node.f_right;
	t_node.f_right=t_child.f_left;
	if((t_child.f_left)!=null){
		t_child.f_left.f_parent=t_node;
	}
	t_child.f_parent=t_node.f_parent;
	if((t_node.f_parent)!=null){
		if(t_node==t_node.f_parent.f_left){
			t_node.f_parent.f_left=t_child;
		}else{
			t_node.f_parent.f_right=t_child;
		}
	}else{
		this.f_root=t_child;
	}
	t_child.f_left=t_node;
	t_node.f_parent=t_child;
	return 0;
}
bb_map_Map.prototype.m_RotateRight=function(t_node){
	var t_child=t_node.f_left;
	t_node.f_left=t_child.f_right;
	if((t_child.f_right)!=null){
		t_child.f_right.f_parent=t_node;
	}
	t_child.f_parent=t_node.f_parent;
	if((t_node.f_parent)!=null){
		if(t_node==t_node.f_parent.f_right){
			t_node.f_parent.f_right=t_child;
		}else{
			t_node.f_parent.f_left=t_child;
		}
	}else{
		this.f_root=t_child;
	}
	t_child.f_right=t_node;
	t_node.f_parent=t_child;
	return 0;
}
bb_map_Map.prototype.m_InsertFixup=function(t_node){
	while(((t_node.f_parent)!=null) && t_node.f_parent.f_color==-1 && ((t_node.f_parent.f_parent)!=null)){
		if(t_node.f_parent==t_node.f_parent.f_parent.f_left){
			var t_uncle=t_node.f_parent.f_parent.f_right;
			if(((t_uncle)!=null) && t_uncle.f_color==-1){
				t_node.f_parent.f_color=1;
				t_uncle.f_color=1;
				t_uncle.f_parent.f_color=-1;
				t_node=t_uncle.f_parent;
			}else{
				if(t_node==t_node.f_parent.f_right){
					t_node=t_node.f_parent;
					this.m_RotateLeft(t_node);
				}
				t_node.f_parent.f_color=1;
				t_node.f_parent.f_parent.f_color=-1;
				this.m_RotateRight(t_node.f_parent.f_parent);
			}
		}else{
			var t_uncle2=t_node.f_parent.f_parent.f_left;
			if(((t_uncle2)!=null) && t_uncle2.f_color==-1){
				t_node.f_parent.f_color=1;
				t_uncle2.f_color=1;
				t_uncle2.f_parent.f_color=-1;
				t_node=t_uncle2.f_parent;
			}else{
				if(t_node==t_node.f_parent.f_left){
					t_node=t_node.f_parent;
					this.m_RotateRight(t_node);
				}
				t_node.f_parent.f_color=1;
				t_node.f_parent.f_parent.f_color=-1;
				this.m_RotateLeft(t_node.f_parent.f_parent);
			}
		}
	}
	this.f_root.f_color=1;
	return 0;
}
bb_map_Map.prototype.m_Set=function(t_key,t_value){
	var t_node=this.f_root;
	var t_parent=null;
	var t_cmp=0;
	while((t_node)!=null){
		t_parent=t_node;
		t_cmp=this.m_Compare(t_key,t_node.f_key);
		if(t_cmp>0){
			t_node=t_node.f_right;
		}else{
			if(t_cmp<0){
				t_node=t_node.f_left;
			}else{
				t_node.f_value=t_value;
				return false;
			}
		}
	}
	t_node=bb_map_Node_new.call(new bb_map_Node,t_key,t_value,-1,t_parent);
	if((t_parent)!=null){
		if(t_cmp>0){
			t_parent.f_right=t_node;
		}else{
			t_parent.f_left=t_node;
		}
		this.m_InsertFixup(t_node);
	}else{
		this.f_root=t_node;
	}
	return true;
}
bb_map_Map.prototype.m_FindNode=function(t_key){
	var t_node=this.f_root;
	while((t_node)!=null){
		var t_cmp=this.m_Compare(t_key,t_node.f_key);
		if(t_cmp>0){
			t_node=t_node.f_right;
		}else{
			if(t_cmp<0){
				t_node=t_node.f_left;
			}else{
				return t_node;
			}
		}
	}
	return t_node;
}
bb_map_Map.prototype.m_Contains=function(t_key){
	return this.m_FindNode(t_key)!=null;
}
bb_map_Map.prototype.m_Get=function(t_key){
	var t_node=this.m_FindNode(t_key);
	if((t_node)!=null){
		return t_node.f_value;
	}
	return null;
}
function bb_map_StringMap(){
	bb_map_Map.call(this);
}
bb_map_StringMap.prototype=extend_class(bb_map_Map);
function bb_map_StringMap_new(){
	bb_map_Map_new.call(this);
	return this;
}
bb_map_StringMap.prototype.m_Compare=function(t_lhs,t_rhs){
	return string_compare(t_lhs,t_rhs);
}
var bb_reflection__classesMap;
var bb_reflection__classes;
function bb_map_Node(){
	Object.call(this);
	this.f_key="";
	this.f_right=null;
	this.f_left=null;
	this.f_value=null;
	this.f_color=0;
	this.f_parent=null;
}
function bb_map_Node_new(t_key,t_value,t_color,t_parent){
	this.f_key=t_key;
	this.f_value=t_value;
	this.f_color=t_color;
	this.f_parent=t_parent;
	return this;
}
function bb_map_Node_new2(){
	return this;
}
function bb_reflection_GetClass(t_name){
	if(!((bb_reflection__classesMap)!=null)){
		bb_reflection__classesMap=bb_map_StringMap_new.call(new bb_map_StringMap);
		var t_=bb_reflection__classes;
		var t_2=0;
		while(t_2<t_.length){
			var t_c=t_[t_2];
			t_2=t_2+1;
			var t_name2=t_c.m_Name();
			bb_reflection__classesMap.m_Set(t_name2,t_c);
			var t_i=t_name2.lastIndexOf(".");
			if(t_i==-1){
				continue;
			}
			t_name2=t_name2.slice(t_i+1);
			if(bb_reflection__classesMap.m_Contains(t_name2)){
				bb_reflection__classesMap.m_Set(t_name2,null);
			}else{
				bb_reflection__classesMap.m_Set(t_name2,t_c);
			}
		}
	}
	return bb_reflection__classesMap.m_Get(t_name);
}
function bb_reflection__GetClass(){
	Object.call(this);
}
bb_reflection__GetClass.prototype.m_GetClass=function(t_obj){
}
function bb_reflection__GetClass_new(){
	return this;
}
var bb_reflection__getClass;
function bb_reflection_GetClass2(t_obj){
	return bb_reflection__getClass.m_GetClass(t_obj);
}
function bb_exception_AssertException(){
	bb_exception_DiddyException.call(this);
}
bb_exception_AssertException.prototype=extend_class(bb_exception_DiddyException);
function bb_exception_AssertException_new(t_message,t_cause){
	bb_exception_DiddyException_new.call(this,t_message,t_cause);
	return this;
}
function bb_exception_ConcurrentModificationException(){
	bb_exception_DiddyException.call(this);
}
bb_exception_ConcurrentModificationException.prototype=extend_class(bb_exception_DiddyException);
function bb_exception_ConcurrentModificationException_new(t_message,t_cause){
	bb_exception_DiddyException_new.call(this,t_message,t_cause);
	return this;
}
function bb_exception_IndexOutOfBoundsException(){
	bb_exception_DiddyException.call(this);
}
bb_exception_IndexOutOfBoundsException.prototype=extend_class(bb_exception_DiddyException);
function bb_exception_IndexOutOfBoundsException_new(t_message,t_cause){
	bb_exception_DiddyException_new.call(this,t_message,t_cause);
	return this;
}
function bb_exception_IllegalArgumentException(){
	bb_exception_DiddyException.call(this);
}
bb_exception_IllegalArgumentException.prototype=extend_class(bb_exception_DiddyException);
function bb_exception_IllegalArgumentException_new(t_message,t_cause){
	bb_exception_DiddyException_new.call(this,t_message,t_cause);
	return this;
}
function bb_exception_XMLParseException(){
	bb_exception_DiddyException.call(this);
}
bb_exception_XMLParseException.prototype=extend_class(bb_exception_DiddyException);
function bb_exception_XMLParseException_new(t_message,t_cause){
	bb_exception_DiddyException_new.call(this,t_message,t_cause);
	return this;
}
function bb_boxes_BoolObject(){
	Object.call(this);
	this.f_value=false;
}
function bb_boxes_BoolObject_new(t_value){
	this.f_value=t_value;
	return this;
}
bb_boxes_BoolObject.prototype.m_ToBool=function(){
	return this.f_value;
}
bb_boxes_BoolObject.prototype.m_Equals=function(t_box){
	return this.f_value==t_box.f_value;
}
function bb_boxes_BoolObject_new2(){
	return this;
}
function bb_boxes_IntObject(){
	Object.call(this);
	this.f_value=0;
}
function bb_boxes_IntObject_new(t_value){
	this.f_value=t_value;
	return this;
}
function bb_boxes_IntObject_new2(t_value){
	this.f_value=((t_value)|0);
	return this;
}
bb_boxes_IntObject.prototype.m_ToInt=function(){
	return this.f_value;
}
bb_boxes_IntObject.prototype.m_ToFloat=function(){
	return (this.f_value);
}
bb_boxes_IntObject.prototype.m_ToString2=function(){
	return String(this.f_value);
}
bb_boxes_IntObject.prototype.m_Equals2=function(t_box){
	return this.f_value==t_box.f_value;
}
bb_boxes_IntObject.prototype.m_Compare2=function(t_box){
	return this.f_value-t_box.f_value;
}
function bb_boxes_IntObject_new3(){
	return this;
}
function bb_boxes_FloatObject(){
	Object.call(this);
	this.f_value=.0;
}
function bb_boxes_FloatObject_new(t_value){
	this.f_value=(t_value);
	return this;
}
function bb_boxes_FloatObject_new2(t_value){
	this.f_value=t_value;
	return this;
}
bb_boxes_FloatObject.prototype.m_ToInt=function(){
	return ((this.f_value)|0);
}
bb_boxes_FloatObject.prototype.m_ToFloat=function(){
	return this.f_value;
}
bb_boxes_FloatObject.prototype.m_ToString2=function(){
	return String(this.f_value);
}
bb_boxes_FloatObject.prototype.m_Equals3=function(t_box){
	return this.f_value==t_box.f_value;
}
bb_boxes_FloatObject.prototype.m_Compare3=function(t_box){
	if(this.f_value<t_box.f_value){
		return -1;
	}
	return ((this.f_value>t_box.f_value)?1:0);
}
function bb_boxes_FloatObject_new3(){
	return this;
}
function bb_boxes_StringObject(){
	Object.call(this);
	this.f_value="";
}
function bb_boxes_StringObject_new(t_value){
	this.f_value=String(t_value);
	return this;
}
function bb_boxes_StringObject_new2(t_value){
	this.f_value=String(t_value);
	return this;
}
function bb_boxes_StringObject_new3(t_value){
	this.f_value=t_value;
	return this;
}
bb_boxes_StringObject.prototype.m_ToString2=function(){
	return this.f_value;
}
bb_boxes_StringObject.prototype.m_Equals4=function(t_box){
	return this.f_value==t_box.f_value;
}
bb_boxes_StringObject.prototype.m_Compare4=function(t_box){
	return string_compare(this.f_value,t_box.f_value);
}
function bb_boxes_StringObject_new4(){
	return this;
}
function bb_boxes_BoxBool(t_value){
	return (bb_boxes_BoolObject_new.call(new bb_boxes_BoolObject,t_value));
}
function bb_boxes_BoxInt(t_value){
	return (bb_boxes_IntObject_new.call(new bb_boxes_IntObject,t_value));
}
function bb_boxes_BoxFloat(t_value){
	return (bb_boxes_FloatObject_new2.call(new bb_boxes_FloatObject,t_value));
}
function bb_boxes_BoxString(t_value){
	return (bb_boxes_StringObject_new3.call(new bb_boxes_StringObject,t_value));
}
function bb_boxes_UnboxBool(t_box){
	return object_downcast((t_box),bb_boxes_BoolObject).f_value;
}
function bb_boxes_UnboxInt(t_box){
	return object_downcast((t_box),bb_boxes_IntObject).f_value;
}
function bb_boxes_UnboxFloat(t_box){
	return object_downcast((t_box),bb_boxes_FloatObject).f_value;
}
function bb_boxes_UnboxString(t_box){
	return object_downcast((t_box),bb_boxes_StringObject).f_value;
}
function bb_reflection_R16(){
	bb_reflection_ClassInfo.call(this);
}
bb_reflection_R16.prototype=extend_class(bb_reflection_ClassInfo);
function bb_reflection_R16_new(){
	bb_reflection_ClassInfo_new.call(this,"monkey.lang.Object",1,null,[]);
	return this;
}
bb_reflection_R16.prototype.m_Init=function(){
	this.m_InitR();
	return 0;
}
function bb_reflection_R17(){
	bb_reflection_ClassInfo.call(this);
}
bb_reflection_R17.prototype=extend_class(bb_reflection_ClassInfo);
function bb_reflection_R17_new(){
	bb_reflection_ClassInfo_new.call(this,"monkey.lang.Throwable",33,bb_reflection__classes[0],[]);
	return this;
}
bb_reflection_R17.prototype.m_Init=function(){
	this.m_InitR();
	return 0;
}
function bb_reflection_R18(){
	bb_reflection_ClassInfo.call(this);
}
bb_reflection_R18.prototype=extend_class(bb_reflection_ClassInfo);
function bb_reflection_R18_new(){
	bb_reflection_ClassInfo_new.call(this,"diddy.exception.DiddyException",32,bb_reflection__classes[1],[]);
	return this;
}
bb_reflection_R18.prototype.m_Init=function(){
	this.f__fields=new_object_array(4);
	this.f__fields[0]=(bb_reflection_R19_new.call(new bb_reflection_R19));
	this.f__fields[1]=(bb_reflection_R20_new.call(new bb_reflection_R20));
	this.f__fields[2]=(bb_reflection_R21_new.call(new bb_reflection_R21));
	this.f__fields[3]=(bb_reflection_R22_new.call(new bb_reflection_R22));
	this.f__methods=new_object_array(7);
	this.f__methods[0]=(bb_reflection_R23_new.call(new bb_reflection_R23));
	this.f__methods[1]=(bb_reflection_R24_new.call(new bb_reflection_R24));
	this.f__methods[2]=(bb_reflection_R25_new.call(new bb_reflection_R25));
	this.f__methods[3]=(bb_reflection_R26_new.call(new bb_reflection_R26));
	this.f__methods[4]=(bb_reflection_R27_new.call(new bb_reflection_R27));
	this.f__methods[5]=(bb_reflection_R28_new.call(new bb_reflection_R28));
	this.f__methods[6]=(bb_reflection_R30_new.call(new bb_reflection_R30));
	this.f__ctors=new_object_array(1);
	this.f__ctors[0]=(bb_reflection_R29_new.call(new bb_reflection_R29));
	this.m_InitR();
	return 0;
}
function bb_reflection_R31(){
	bb_reflection_ClassInfo.call(this);
}
bb_reflection_R31.prototype=extend_class(bb_reflection_ClassInfo);
function bb_reflection_R31_new(){
	bb_reflection_ClassInfo_new.call(this,"diddy.exception.AssertException",32,bb_reflection__classes[2],[]);
	return this;
}
bb_reflection_R31.prototype.m_Init=function(){
	this.f__ctors=new_object_array(1);
	this.f__ctors[0]=(bb_reflection_R32_new.call(new bb_reflection_R32));
	this.m_InitR();
	return 0;
}
function bb_reflection_R33(){
	bb_reflection_ClassInfo.call(this);
}
bb_reflection_R33.prototype=extend_class(bb_reflection_ClassInfo);
function bb_reflection_R33_new(){
	bb_reflection_ClassInfo_new.call(this,"diddy.exception.ConcurrentModificationException",32,bb_reflection__classes[2],[]);
	return this;
}
bb_reflection_R33.prototype.m_Init=function(){
	this.f__ctors=new_object_array(1);
	this.f__ctors[0]=(bb_reflection_R34_new.call(new bb_reflection_R34));
	this.m_InitR();
	return 0;
}
function bb_reflection_R35(){
	bb_reflection_ClassInfo.call(this);
}
bb_reflection_R35.prototype=extend_class(bb_reflection_ClassInfo);
function bb_reflection_R35_new(){
	bb_reflection_ClassInfo_new.call(this,"diddy.exception.IndexOutOfBoundsException",32,bb_reflection__classes[2],[]);
	return this;
}
bb_reflection_R35.prototype.m_Init=function(){
	this.f__ctors=new_object_array(1);
	this.f__ctors[0]=(bb_reflection_R36_new.call(new bb_reflection_R36));
	this.m_InitR();
	return 0;
}
function bb_reflection_R37(){
	bb_reflection_ClassInfo.call(this);
}
bb_reflection_R37.prototype=extend_class(bb_reflection_ClassInfo);
function bb_reflection_R37_new(){
	bb_reflection_ClassInfo_new.call(this,"diddy.exception.IllegalArgumentException",32,bb_reflection__classes[2],[]);
	return this;
}
bb_reflection_R37.prototype.m_Init=function(){
	this.f__ctors=new_object_array(1);
	this.f__ctors[0]=(bb_reflection_R38_new.call(new bb_reflection_R38));
	this.m_InitR();
	return 0;
}
function bb_reflection_R39(){
	bb_reflection_ClassInfo.call(this);
}
bb_reflection_R39.prototype=extend_class(bb_reflection_ClassInfo);
function bb_reflection_R39_new(){
	bb_reflection_ClassInfo_new.call(this,"diddy.exception.XMLParseException",32,bb_reflection__classes[2],[]);
	return this;
}
bb_reflection_R39.prototype.m_Init=function(){
	this.f__ctors=new_object_array(1);
	this.f__ctors[0]=(bb_reflection_R40_new.call(new bb_reflection_R40));
	this.m_InitR();
	return 0;
}
function bb_reflection_R41(){
	bb_reflection_ClassInfo.call(this);
}
bb_reflection_R41.prototype=extend_class(bb_reflection_ClassInfo);
function bb_reflection_R41_new(){
	bb_reflection_ClassInfo_new.call(this,"monkey.boxes.BoolObject",0,bb_reflection__classes[0],[]);
	bb_reflection__boolClass=(this);
	return this;
}
bb_reflection_R41.prototype.m_Init=function(){
	this.f__fields=new_object_array(1);
	this.f__fields[0]=(bb_reflection_R42_new.call(new bb_reflection_R42));
	this.f__methods=new_object_array(2);
	this.f__methods[0]=(bb_reflection_R44_new.call(new bb_reflection_R44));
	this.f__methods[1]=(bb_reflection_R45_new.call(new bb_reflection_R45));
	this.f__ctors=new_object_array(2);
	this.f__ctors[0]=(bb_reflection_R43_new.call(new bb_reflection_R43));
	this.f__ctors[1]=(bb_reflection_R46_new.call(new bb_reflection_R46));
	this.m_InitR();
	return 0;
}
var bb_reflection__boolClass;
function bb_reflection_R47(){
	bb_reflection_ClassInfo.call(this);
}
bb_reflection_R47.prototype=extend_class(bb_reflection_ClassInfo);
function bb_reflection_R47_new(){
	bb_reflection_ClassInfo_new.call(this,"monkey.boxes.IntObject",0,bb_reflection__classes[0],[]);
	bb_reflection__intClass=(this);
	return this;
}
bb_reflection_R47.prototype.m_Init=function(){
	this.f__fields=new_object_array(1);
	this.f__fields[0]=(bb_reflection_R48_new.call(new bb_reflection_R48));
	this.f__methods=new_object_array(5);
	this.f__methods[0]=(bb_reflection_R51_new.call(new bb_reflection_R51));
	this.f__methods[1]=(bb_reflection_R52_new.call(new bb_reflection_R52));
	this.f__methods[2]=(bb_reflection_R53_new.call(new bb_reflection_R53));
	this.f__methods[3]=(bb_reflection_R54_new.call(new bb_reflection_R54));
	this.f__methods[4]=(bb_reflection_R55_new.call(new bb_reflection_R55));
	this.f__ctors=new_object_array(3);
	this.f__ctors[0]=(bb_reflection_R49_new.call(new bb_reflection_R49));
	this.f__ctors[1]=(bb_reflection_R50_new.call(new bb_reflection_R50));
	this.f__ctors[2]=(bb_reflection_R56_new.call(new bb_reflection_R56));
	this.m_InitR();
	return 0;
}
var bb_reflection__intClass;
function bb_reflection_R57(){
	bb_reflection_ClassInfo.call(this);
}
bb_reflection_R57.prototype=extend_class(bb_reflection_ClassInfo);
function bb_reflection_R57_new(){
	bb_reflection_ClassInfo_new.call(this,"monkey.boxes.FloatObject",0,bb_reflection__classes[0],[]);
	bb_reflection__floatClass=(this);
	return this;
}
bb_reflection_R57.prototype.m_Init=function(){
	this.f__fields=new_object_array(1);
	this.f__fields[0]=(bb_reflection_R58_new.call(new bb_reflection_R58));
	this.f__methods=new_object_array(5);
	this.f__methods[0]=(bb_reflection_R61_new.call(new bb_reflection_R61));
	this.f__methods[1]=(bb_reflection_R62_new.call(new bb_reflection_R62));
	this.f__methods[2]=(bb_reflection_R63_new.call(new bb_reflection_R63));
	this.f__methods[3]=(bb_reflection_R64_new.call(new bb_reflection_R64));
	this.f__methods[4]=(bb_reflection_R65_new.call(new bb_reflection_R65));
	this.f__ctors=new_object_array(3);
	this.f__ctors[0]=(bb_reflection_R59_new.call(new bb_reflection_R59));
	this.f__ctors[1]=(bb_reflection_R60_new.call(new bb_reflection_R60));
	this.f__ctors[2]=(bb_reflection_R66_new.call(new bb_reflection_R66));
	this.m_InitR();
	return 0;
}
var bb_reflection__floatClass;
function bb_reflection_R67(){
	bb_reflection_ClassInfo.call(this);
}
bb_reflection_R67.prototype=extend_class(bb_reflection_ClassInfo);
function bb_reflection_R67_new(){
	bb_reflection_ClassInfo_new.call(this,"monkey.boxes.StringObject",0,bb_reflection__classes[0],[]);
	bb_reflection__stringClass=(this);
	return this;
}
bb_reflection_R67.prototype.m_Init=function(){
	this.f__fields=new_object_array(1);
	this.f__fields[0]=(bb_reflection_R68_new.call(new bb_reflection_R68));
	this.f__methods=new_object_array(3);
	this.f__methods[0]=(bb_reflection_R72_new.call(new bb_reflection_R72));
	this.f__methods[1]=(bb_reflection_R73_new.call(new bb_reflection_R73));
	this.f__methods[2]=(bb_reflection_R74_new.call(new bb_reflection_R74));
	this.f__ctors=new_object_array(4);
	this.f__ctors[0]=(bb_reflection_R69_new.call(new bb_reflection_R69));
	this.f__ctors[1]=(bb_reflection_R70_new.call(new bb_reflection_R70));
	this.f__ctors[2]=(bb_reflection_R71_new.call(new bb_reflection_R71));
	this.f__ctors[3]=(bb_reflection_R75_new.call(new bb_reflection_R75));
	this.m_InitR();
	return 0;
}
var bb_reflection__stringClass;
function bb_reflection_FunctionInfo(){
	Object.call(this);
	this.f__name="";
	this.f__attrs=0;
	this.f__retType=null;
	this.f__argTypes=[];
}
function bb_reflection_FunctionInfo_new(t_name,t_attrs,t_retType,t_argTypes){
	this.f__name=t_name;
	this.f__attrs=t_attrs;
	this.f__retType=t_retType;
	this.f__argTypes=t_argTypes;
	return this;
}
function bb_reflection_FunctionInfo_new2(){
	return this;
}
var bb_reflection__functions;
function bb_reflection_R4(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R4.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R4_new(){
	bb_reflection_FunctionInfo_new.call(this,"monkey.boxes.BoxBool",0,bb_reflection__classes[0],[bb_reflection__boolClass]);
	return this;
}
function bb_reflection_R5(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R5.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R5_new(){
	bb_reflection_FunctionInfo_new.call(this,"monkey.boxes.BoxInt",0,bb_reflection__classes[0],[bb_reflection__intClass]);
	return this;
}
function bb_reflection_R6(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R6.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R6_new(){
	bb_reflection_FunctionInfo_new.call(this,"monkey.boxes.BoxFloat",0,bb_reflection__classes[0],[bb_reflection__floatClass]);
	return this;
}
function bb_reflection_R7(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R7.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R7_new(){
	bb_reflection_FunctionInfo_new.call(this,"monkey.boxes.BoxString",0,bb_reflection__classes[0],[bb_reflection__stringClass]);
	return this;
}
function bb_reflection_R8(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R8.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R8_new(){
	bb_reflection_FunctionInfo_new.call(this,"monkey.boxes.UnboxBool",0,bb_reflection__boolClass,[bb_reflection__classes[0]]);
	return this;
}
function bb_reflection_R9(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R9.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R9_new(){
	bb_reflection_FunctionInfo_new.call(this,"monkey.boxes.UnboxInt",0,bb_reflection__intClass,[bb_reflection__classes[0]]);
	return this;
}
function bb_reflection_R10(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R10.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R10_new(){
	bb_reflection_FunctionInfo_new.call(this,"monkey.boxes.UnboxFloat",0,bb_reflection__floatClass,[bb_reflection__classes[0]]);
	return this;
}
function bb_reflection_R11(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R11.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R11_new(){
	bb_reflection_FunctionInfo_new.call(this,"monkey.boxes.UnboxString",0,bb_reflection__stringClass,[bb_reflection__classes[0]]);
	return this;
}
function bb_reflection_R12(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R12.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R12_new(){
	bb_reflection_FunctionInfo_new.call(this,"monkey.lang.Print",1,bb_reflection__intClass,[bb_reflection__stringClass]);
	return this;
}
function bb_reflection_R13(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R13.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R13_new(){
	bb_reflection_FunctionInfo_new.call(this,"monkey.lang.Error",1,bb_reflection__intClass,[bb_reflection__stringClass]);
	return this;
}
function bb_reflection_R14(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R14.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R14_new(){
	bb_reflection_FunctionInfo_new.call(this,"monkey.lang.DebugLog",1,bb_reflection__intClass,[bb_reflection__stringClass]);
	return this;
}
function bb_reflection_R15(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R15.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R15_new(){
	bb_reflection_FunctionInfo_new.call(this,"monkey.lang.DebugStop",1,bb_reflection__intClass,[]);
	return this;
}
function bb_reflection___GetClass(){
	bb_reflection__GetClass.call(this);
}
bb_reflection___GetClass.prototype=extend_class(bb_reflection__GetClass);
function bb_reflection___GetClass_new(){
	bb_reflection__GetClass_new.call(this);
	return this;
}
bb_reflection___GetClass.prototype.m_GetClass=function(t_o){
	if(object_downcast((t_o),bb_boxes_StringObject)!=null){
		return bb_reflection__classes[11];
	}
	if(object_downcast((t_o),bb_boxes_FloatObject)!=null){
		return bb_reflection__classes[10];
	}
	if(object_downcast((t_o),bb_boxes_IntObject)!=null){
		return bb_reflection__classes[9];
	}
	if(object_downcast((t_o),bb_boxes_BoolObject)!=null){
		return bb_reflection__classes[8];
	}
	if(object_downcast((t_o),bb_exception_XMLParseException)!=null){
		return bb_reflection__classes[7];
	}
	if(object_downcast((t_o),bb_exception_IllegalArgumentException)!=null){
		return bb_reflection__classes[6];
	}
	if(object_downcast((t_o),bb_exception_IndexOutOfBoundsException)!=null){
		return bb_reflection__classes[5];
	}
	if(object_downcast((t_o),bb_exception_ConcurrentModificationException)!=null){
		return bb_reflection__classes[4];
	}
	if(object_downcast((t_o),bb_exception_AssertException)!=null){
		return bb_reflection__classes[3];
	}
	if(object_downcast((t_o),bb_exception_DiddyException)!=null){
		return bb_reflection__classes[2];
	}
	if(object_downcast((t_o),ThrowableObject)!=null){
		return bb_reflection__classes[1];
	}
	if(t_o!=null){
		return bb_reflection__classes[0];
	}
	return bb_reflection__unknownClass;
}
function bb_reflection___init(){
	bb_reflection__classes=new_object_array(12);
	bb_reflection__classes[0]=(bb_reflection_R16_new.call(new bb_reflection_R16));
	bb_reflection__classes[1]=(bb_reflection_R17_new.call(new bb_reflection_R17));
	bb_reflection__classes[2]=(bb_reflection_R18_new.call(new bb_reflection_R18));
	bb_reflection__classes[3]=(bb_reflection_R31_new.call(new bb_reflection_R31));
	bb_reflection__classes[4]=(bb_reflection_R33_new.call(new bb_reflection_R33));
	bb_reflection__classes[5]=(bb_reflection_R35_new.call(new bb_reflection_R35));
	bb_reflection__classes[6]=(bb_reflection_R37_new.call(new bb_reflection_R37));
	bb_reflection__classes[7]=(bb_reflection_R39_new.call(new bb_reflection_R39));
	bb_reflection__classes[8]=(bb_reflection_R41_new.call(new bb_reflection_R41));
	bb_reflection__classes[9]=(bb_reflection_R47_new.call(new bb_reflection_R47));
	bb_reflection__classes[10]=(bb_reflection_R57_new.call(new bb_reflection_R57));
	bb_reflection__classes[11]=(bb_reflection_R67_new.call(new bb_reflection_R67));
	bb_reflection__classes[0].m_Init();
	bb_reflection__classes[1].m_Init();
	bb_reflection__classes[2].m_Init();
	bb_reflection__classes[3].m_Init();
	bb_reflection__classes[4].m_Init();
	bb_reflection__classes[5].m_Init();
	bb_reflection__classes[6].m_Init();
	bb_reflection__classes[7].m_Init();
	bb_reflection__classes[8].m_Init();
	bb_reflection__classes[9].m_Init();
	bb_reflection__classes[10].m_Init();
	bb_reflection__classes[11].m_Init();
	bb_reflection__functions=new_object_array(12);
	bb_reflection__functions[0]=(bb_reflection_R4_new.call(new bb_reflection_R4));
	bb_reflection__functions[1]=(bb_reflection_R5_new.call(new bb_reflection_R5));
	bb_reflection__functions[2]=(bb_reflection_R6_new.call(new bb_reflection_R6));
	bb_reflection__functions[3]=(bb_reflection_R7_new.call(new bb_reflection_R7));
	bb_reflection__functions[4]=(bb_reflection_R8_new.call(new bb_reflection_R8));
	bb_reflection__functions[5]=(bb_reflection_R9_new.call(new bb_reflection_R9));
	bb_reflection__functions[6]=(bb_reflection_R10_new.call(new bb_reflection_R10));
	bb_reflection__functions[7]=(bb_reflection_R11_new.call(new bb_reflection_R11));
	bb_reflection__functions[8]=(bb_reflection_R12_new.call(new bb_reflection_R12));
	bb_reflection__functions[9]=(bb_reflection_R13_new.call(new bb_reflection_R13));
	bb_reflection__functions[10]=(bb_reflection_R14_new.call(new bb_reflection_R14));
	bb_reflection__functions[11]=(bb_reflection_R15_new.call(new bb_reflection_R15));
	bb_reflection__getClass=(bb_reflection___GetClass_new.call(new bb_reflection___GetClass));
	return 0;
}
var bb_reflection__init;
function bb_app_App(){
	Object.call(this);
}
function bb_app_App_new(){
	bb_app_device=bb_app_AppDevice_new.call(new bb_app_AppDevice,this);
	return this;
}
bb_app_App.prototype.m_OnCreate=function(){
	return 0;
}
bb_app_App.prototype.m_OnUpdate=function(){
	return 0;
}
bb_app_App.prototype.m_OnSuspend=function(){
	return 0;
}
bb_app_App.prototype.m_OnResume=function(){
	return 0;
}
bb_app_App.prototype.m_OnRender=function(){
	return 0;
}
bb_app_App.prototype.m_OnLoading=function(){
	return 0;
}
function bb_framework_DiddyApp(){
	bb_app_App.call(this);
	this.f_exitScreen=null;
	this.f_screenFade=null;
	this.f_images=null;
	this.f_sounds=null;
	this.f_screens=null;
	this.f_inputCache=null;
	this.f_diddyMouse=null;
	this.f_virtualResOn=true;
	this.f_aspectRatioOn=false;
	this.f_aspectRatio=.0;
	this.f_deviceChanged=0;
	this.f_mouseX=0;
	this.f_mouseY=0;
	this.f_FPS=60;
	this.f_useFixedRateLogic=false;
	this.f_frameRate=200.0;
	this.f_ms=0.0;
	this.f_numTicks=.0;
	this.f_lastNumTicks=.0;
	this.f_lastTime=.0;
	this.f_multi=.0;
	this.f_heightBorder=.0;
	this.f_widthBorder=.0;
	this.f_vsx=.0;
	this.f_vsy=.0;
	this.f_vsw=.0;
	this.f_vsh=.0;
	this.f_virtualScaledW=.0;
	this.f_virtualScaledH=.0;
	this.f_virtualXOff=.0;
	this.f_virtualYOff=.0;
	this.f_autoCls=false;
	this.f_currentScreen=null;
	this.f_debugOn=false;
	this.f_musicFile="";
	this.f_musicOkay=0;
	this.f_musicVolume=100;
	this.f_mojoMusicVolume=1.0;
	this.f_soundVolume=100;
	this.f_drawFPSOn=false;
	this.f_mouseHit=0;
	this.f_debugKeyOn=false;
	this.f_debugKey=112;
	this.f_tmpMs=.0;
	this.f_maxMs=50;
	this.f_nextScreen=null;
}
bb_framework_DiddyApp.prototype=extend_class(bb_app_App);
function bb_framework_DiddyApp_new(){
	bb_app_App_new.call(this);
	bb_framework_game=this;
	this.f_exitScreen=bb_framework_ExitScreen_new.call(new bb_framework_ExitScreen);
	this.f_screenFade=bb_framework_ScreenFade_new.call(new bb_framework_ScreenFade);
	this.f_images=bb_framework_ImageBank_new.call(new bb_framework_ImageBank);
	this.f_sounds=bb_framework_SoundBank_new.call(new bb_framework_SoundBank);
	this.f_screens=bb_framework_Screens_new.call(new bb_framework_Screens);
	this.f_inputCache=bb_inputcache_InputCache_new.call(new bb_inputcache_InputCache);
	this.f_diddyMouse=bb_framework_DiddyMouse_new.call(new bb_framework_DiddyMouse);
	return this;
}
bb_framework_DiddyApp.prototype.m_SetScreenSize=function(t_w,t_h,t_useAspectRatio){
	bb_framework_SCREEN_WIDTH=t_w;
	bb_framework_SCREEN_HEIGHT=t_h;
	bb_framework_SCREEN_WIDTH2=bb_framework_SCREEN_WIDTH/2.0;
	bb_framework_SCREEN_HEIGHT2=bb_framework_SCREEN_HEIGHT/2.0;
	bb_framework_SCREENX_RATIO=bb_framework_DEVICE_WIDTH/bb_framework_SCREEN_WIDTH;
	bb_framework_SCREENY_RATIO=bb_framework_DEVICE_HEIGHT/bb_framework_SCREEN_HEIGHT;
	if(bb_framework_SCREENX_RATIO!=1.0 || bb_framework_SCREENY_RATIO!=1.0){
		this.f_virtualResOn=true;
		this.f_aspectRatioOn=t_useAspectRatio;
		this.f_aspectRatio=t_h/t_w;
	}
	if((bb_graphics_DeviceWidth())!=bb_framework_SCREEN_WIDTH || (bb_graphics_DeviceHeight())!=bb_framework_SCREEN_HEIGHT){
		this.f_deviceChanged=1;
	}
}
bb_framework_DiddyApp.prototype.m_ResetFixedRateLogic=function(){
	this.f_ms=1000.0/this.f_frameRate;
	this.f_numTicks=0.0;
	this.f_lastNumTicks=1.0;
	this.f_lastTime=(bb_app_Millisecs());
	if(bb_framework_dt!=null){
		bb_framework_dt.f_delta=1.0;
	}
}
bb_framework_DiddyApp.prototype.m_Create=function(){
}
bb_framework_DiddyApp.prototype.m_OnCreate=function(){
	try{
		bb_framework_DEVICE_WIDTH=(bb_graphics_DeviceWidth());
		bb_framework_DEVICE_HEIGHT=(bb_graphics_DeviceHeight());
		this.m_SetScreenSize(bb_framework_DEVICE_WIDTH,bb_framework_DEVICE_HEIGHT,false);
		this.f_deviceChanged=1;
		this.f_mouseX=((bb_input_MouseX()/bb_framework_SCREENX_RATIO)|0);
		this.f_mouseY=((bb_input_MouseY()/bb_framework_SCREENY_RATIO)|0);
		bb_random_Seed=diddy.systemMillisecs();
		bb_framework_dt=bb_framework_DeltaTimer_new.call(new bb_framework_DeltaTimer,(this.f_FPS));
		bb_app_SetUpdateRate(this.f_FPS);
		bb_framework_Particle_Cache();
		if(this.f_useFixedRateLogic){
			this.m_ResetFixedRateLogic();
		}
		this.m_Create();
	}catch(_eek_){
		if(t_e=object_downcast(_eek_,bb_exception_DiddyException)){
			print(t_e.m_ToString(true));
			error(t_e.m_ToString(false));
		}else{
			throw _eek_;
		}
	}
	return 0;
}
bb_framework_DiddyApp.prototype.m_DrawDebug=function(){
	bb_graphics_SetColor(255.0,255.0,255.0);
	bb_framework_FPSCounter_Draw(0,0,0.0,0.0);
	var t_y=10;
	var t_gap=14;
	bb_graphics_DrawText("Screen             = "+this.f_currentScreen.f_name,0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("Delta              = "+bb_functions_FormatNumber(bb_framework_dt.f_delta,2,0,0),0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("Frame Time         = "+String(bb_framework_dt.f_frametime),0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("Screen Width       = "+String(bb_framework_SCREEN_WIDTH),0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("Screen Height      = "+String(bb_framework_SCREEN_HEIGHT),0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("VMouseX            = "+String(this.f_mouseX),0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("VMouseY            = "+String(this.f_mouseY),0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("MouseX             = "+String(bb_input_MouseX()),0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("MouseY             = "+String(bb_input_MouseY()),0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("Music File         = "+this.f_musicFile,0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("MusicOkay          = "+String(this.f_musicOkay),0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("Music State        = "+String(bb_audio_MusicState()),0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("Music Volume       = "+String(this.f_musicVolume),0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("Mojo Music Volume  = "+String(this.f_mojoMusicVolume),0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("Sound Volume       = "+String(this.f_soundVolume),0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
	bb_graphics_DrawText("Sound Channel      = "+String(bb_framework_SoundPlayer_channel),0.0,(t_y),0.0,0.0);
	t_y+=t_gap;
}
bb_framework_DiddyApp.prototype.m_DrawFPS=function(){
	bb_graphics_DrawText(String(bb_framework_FPSCounter_totalFPS),0.0,0.0,0.0,0.0);
}
bb_framework_DiddyApp.prototype.m_OnRender=function(){
	try{
		bb_framework_FPSCounter_Update();
		if(this.f_virtualResOn){
			bb_graphics_PushMatrix();
			if(this.f_aspectRatioOn){
				if((bb_graphics_DeviceWidth())!=bb_framework_DEVICE_WIDTH || (bb_graphics_DeviceHeight())!=bb_framework_DEVICE_HEIGHT || ((this.f_deviceChanged)!=0)){
					bb_framework_DEVICE_WIDTH=(bb_graphics_DeviceWidth());
					bb_framework_DEVICE_HEIGHT=(bb_graphics_DeviceHeight());
					this.f_deviceChanged=0;
					var t_deviceRatio=bb_framework_DEVICE_HEIGHT/bb_framework_DEVICE_WIDTH;
					if(t_deviceRatio>=this.f_aspectRatio){
						this.f_multi=bb_framework_DEVICE_WIDTH/bb_framework_SCREEN_WIDTH;
						this.f_heightBorder=(bb_framework_DEVICE_HEIGHT-bb_framework_SCREEN_HEIGHT*this.f_multi)*0.5;
						this.f_widthBorder=0.0;
					}else{
						this.f_multi=bb_framework_DEVICE_HEIGHT/bb_framework_SCREEN_HEIGHT;
						this.f_widthBorder=(bb_framework_DEVICE_WIDTH-bb_framework_SCREEN_WIDTH*this.f_multi)*0.5;
						this.f_heightBorder=0.0;
					}
					this.f_vsx=bb_math_Max2(0.0,this.f_widthBorder);
					this.f_vsy=bb_math_Max2(0.0,this.f_heightBorder);
					this.f_vsw=bb_math_Min2(bb_framework_DEVICE_WIDTH-this.f_widthBorder*2.0,bb_framework_DEVICE_WIDTH);
					this.f_vsh=bb_math_Min2(bb_framework_DEVICE_HEIGHT-this.f_heightBorder*2.0,bb_framework_DEVICE_HEIGHT);
					this.f_virtualScaledW=bb_framework_SCREEN_WIDTH*this.f_multi;
					this.f_virtualScaledH=bb_framework_SCREEN_HEIGHT*this.f_multi;
					this.f_virtualXOff=(bb_framework_DEVICE_WIDTH-this.f_virtualScaledW)*0.5;
					this.f_virtualYOff=(bb_framework_DEVICE_HEIGHT-this.f_virtualScaledH)*0.5;
					this.f_virtualXOff=this.f_virtualXOff/this.f_multi;
					this.f_virtualYOff=this.f_virtualYOff/this.f_multi;
				}
				bb_graphics_SetScissor(0.0,0.0,bb_framework_DEVICE_WIDTH,bb_framework_DEVICE_HEIGHT);
				bb_graphics_Cls(0.0,0.0,0.0);
				bb_graphics_SetScissor(this.f_vsx,this.f_vsy,this.f_vsw,this.f_vsh);
				bb_graphics_Scale(this.f_multi,this.f_multi);
				bb_graphics_Translate(this.f_virtualXOff,this.f_virtualYOff);
			}else{
				bb_graphics_Scale(bb_framework_SCREENX_RATIO,bb_framework_SCREENY_RATIO);
			}
		}
		if(this.f_autoCls){
			bb_graphics_Cls(0.0,0.0,0.0);
		}
		this.f_currentScreen.m_RenderBackgroundLayers();
		this.f_currentScreen.m_Render();
		this.f_currentScreen.m_RenderForegroundLayers();
		if(this.f_virtualResOn){
			if(this.f_aspectRatioOn){
				bb_graphics_SetScissor(0.0,0.0,bb_framework_DEVICE_WIDTH,bb_framework_DEVICE_HEIGHT);
			}
			bb_graphics_PopMatrix();
		}
		this.f_currentScreen.m_ExtraRender();
		if(this.f_screenFade.f_active){
			this.f_screenFade.m_Render();
		}
		this.f_currentScreen.m_DebugRender();
		if(this.f_debugOn){
			this.m_DrawDebug();
		}
		if(this.f_drawFPSOn){
			this.m_DrawFPS();
		}
		this.f_diddyMouse.m_Update2();
	}catch(_eek_){
		if(t_e=object_downcast(_eek_,bb_exception_DiddyException)){
			print(t_e.m_ToString(true));
			error(t_e.m_ToString(false));
		}else{
			throw _eek_;
		}
	}
	return 0;
}
bb_framework_DiddyApp.prototype.m_ReadInputs=function(){
	if(this.f_aspectRatioOn){
		var t_mouseOffsetX=bb_input_MouseX()-bb_framework_DEVICE_WIDTH*0.5;
		var t_x=t_mouseOffsetX/this.f_multi/1.0+bb_framework_SCREEN_WIDTH*0.5;
		this.f_mouseX=((t_x)|0);
		var t_mouseOffsetY=bb_input_MouseY()-bb_framework_DEVICE_HEIGHT*0.5;
		var t_y=t_mouseOffsetY/this.f_multi/1.0+bb_framework_SCREEN_HEIGHT*0.5;
		this.f_mouseY=((t_y)|0);
	}else{
		this.f_mouseX=((bb_input_MouseX()/bb_framework_SCREENX_RATIO)|0);
		this.f_mouseY=((bb_input_MouseY()/bb_framework_SCREENY_RATIO)|0);
	}
	this.f_mouseHit=bb_input_MouseHit(0);
	this.f_inputCache.m_ReadInput();
	this.f_inputCache.m_HandleEvents(this.f_currentScreen);
	if(this.f_debugKeyOn){
		if((bb_input_KeyHit(this.f_debugKey))!=0){
			this.f_debugOn=!this.f_debugOn;
		}
	}
}
bb_framework_DiddyApp.prototype.m_OverrideUpdate=function(){
}
bb_framework_DiddyApp.prototype.m_SetMojoMusicVolume=function(t_volume){
	if(t_volume<0.0){
		t_volume=0.0;
	}
	if(t_volume>1.0){
		t_volume=1.0;
	}
	this.f_mojoMusicVolume=t_volume;
	bb_audio_SetMusicVolume(this.f_mojoMusicVolume);
}
bb_framework_DiddyApp.prototype.m_CalcAnimLength=function(t_ms){
	return (t_ms)/(1000.0/(this.f_FPS));
}
bb_framework_DiddyApp.prototype.m_MusicPlay=function(t_file,t_flags){
	this.f_musicFile=t_file;
	this.f_musicOkay=bb_audio_PlayMusic("music/"+this.f_musicFile,t_flags);
	if(this.f_musicOkay==-1){
		print("Error Playing Music - Music must be in the data\\music folder");
	}
}
bb_framework_DiddyApp.prototype.m_Update=function(t_fixedRateLogicDelta){
	bb_framework_dt.m_UpdateDelta();
	if(this.f_useFixedRateLogic){
		bb_framework_dt.f_delta=t_fixedRateLogicDelta;
	}
	if(this.f_screenFade.f_active){
		this.f_screenFade.m_Update2();
	}
	if(!this.f_screenFade.f_active || this.f_screenFade.f_allowScreenUpdate){
		this.f_currentScreen.m_Update2();
	}
}
bb_framework_DiddyApp.prototype.m_OnUpdate=function(){
	try{
		this.m_ReadInputs();
		this.m_OverrideUpdate();
		if(this.f_useFixedRateLogic){
			var t_now=bb_app_Millisecs();
			if((t_now)<this.f_lastTime){
				this.f_numTicks=this.f_lastNumTicks;
			}else{
				this.f_tmpMs=(t_now)-this.f_lastTime;
				if(this.f_tmpMs>(this.f_maxMs)){
					this.f_tmpMs=(this.f_maxMs);
				}
				this.f_numTicks=this.f_tmpMs/this.f_ms;
			}
			this.f_lastTime=(t_now);
			this.f_lastNumTicks=this.f_numTicks;
			for(var t_i=1;(t_i)<=Math.floor(this.f_numTicks);t_i=t_i+1){
				this.m_Update(1.0);
			}
			var t_re=this.f_numTicks % 1.0;
			if(t_re>0.0){
				this.m_Update(t_re);
			}
		}else{
			this.m_Update(0.0);
		}
	}catch(_eek_){
		if(t_e=object_downcast(_eek_,bb_exception_DiddyException)){
			print(t_e.m_ToString(true));
			error(t_e.m_ToString(false));
		}else{
			throw _eek_;
		}
	}
	return 0;
}
bb_framework_DiddyApp.prototype.m_OnSuspend=function(){
	try{
		this.f_currentScreen.m_Suspend();
	}catch(_eek_){
		if(t_e=object_downcast(_eek_,bb_exception_DiddyException)){
			print(t_e.m_ToString(true));
			error(t_e.m_ToString(false));
		}else{
			throw _eek_;
		}
	}
	return 0;
}
bb_framework_DiddyApp.prototype.m_OnResume=function(){
	try{
		bb_framework_dt.f_currentticks=(bb_app_Millisecs());
		bb_framework_dt.f_lastticks=bb_framework_dt.f_currentticks;
		this.f_currentScreen.m_Resume();
	}catch(_eek_){
		if(t_e=object_downcast(_eek_,bb_exception_DiddyException)){
			print(t_e.m_ToString(true));
			error(t_e.m_ToString(false));
		}else{
			throw _eek_;
		}
	}
	return 0;
}
bb_framework_DiddyApp.prototype.m_Start=function(t_firstScreen,t_autoFadeIn,t_fadeInTime,t_fadeSound,t_fadeMusic){
	t_firstScreen.f_autoFadeIn=t_autoFadeIn;
	if(t_autoFadeIn){
		t_firstScreen.f_autoFadeInTime=t_fadeInTime;
		t_firstScreen.f_autoFadeInSound=t_fadeSound;
		t_firstScreen.f_autoFadeInMusic=t_fadeMusic;
	}
	t_firstScreen.m_PreStart();
}
function bb_pong_PongApp(){
	bb_framework_DiddyApp.call(this);
}
bb_pong_PongApp.prototype=extend_class(bb_framework_DiddyApp);
function bb_pong_PongApp_new(){
	bb_framework_DiddyApp_new.call(this);
	return this;
}
bb_pong_PongApp.prototype.m_Create=function(){
	bb_functions_SetGraphics(1024,768);
	this.m_SetScreenSize(1024.0,768.0,false);
	this.f_drawFPSOn=true;
	bb_pong_gameScreen=bb_pong_GameScreen_new.call(new bb_pong_GameScreen);
	bb_pong_gameOverScreen=bb_pong_GameOverScreen_new.call(new bb_pong_GameOverScreen);
	this.m_Start((bb_pong_gameScreen),true,bb_framework_defaultFadeTime,false,false);
}
function bb_app_AppDevice(){
	gxtkApp.call(this);
	this.f_app=null;
	this.f_updateRate=0;
}
bb_app_AppDevice.prototype=extend_class(gxtkApp);
function bb_app_AppDevice_new(t_app){
	this.f_app=t_app;
	bb_graphics_SetGraphicsDevice(this.GraphicsDevice());
	bb_input_SetInputDevice(this.InputDevice());
	bb_audio_SetAudioDevice(this.AudioDevice());
	return this;
}
function bb_app_AppDevice_new2(){
	return this;
}
bb_app_AppDevice.prototype.OnCreate=function(){
	bb_graphics_SetFont(null,32);
	return this.f_app.m_OnCreate();
}
bb_app_AppDevice.prototype.OnUpdate=function(){
	return this.f_app.m_OnUpdate();
}
bb_app_AppDevice.prototype.OnSuspend=function(){
	return this.f_app.m_OnSuspend();
}
bb_app_AppDevice.prototype.OnResume=function(){
	return this.f_app.m_OnResume();
}
bb_app_AppDevice.prototype.OnRender=function(){
	bb_graphics_BeginRender();
	var t_r=this.f_app.m_OnRender();
	bb_graphics_EndRender();
	return t_r;
}
bb_app_AppDevice.prototype.OnLoading=function(){
	bb_graphics_BeginRender();
	var t_r=this.f_app.m_OnLoading();
	bb_graphics_EndRender();
	return t_r;
}
bb_app_AppDevice.prototype.SetUpdateRate=function(t_hertz){
	gxtkApp.prototype.SetUpdateRate.call(this,t_hertz);
	this.f_updateRate=t_hertz;
	return 0;
}
var bb_graphics_device;
function bb_graphics_SetGraphicsDevice(t_dev){
	bb_graphics_device=t_dev;
	return 0;
}
var bb_input_device;
function bb_input_SetInputDevice(t_dev){
	bb_input_device=t_dev;
	return 0;
}
var bb_audio_device;
function bb_audio_SetAudioDevice(t_dev){
	bb_audio_device=t_dev;
	return 0;
}
var bb_app_device;
var bb_framework_game;
function bb_framework_Screen(){
	Object.call(this);
	this.f_name="";
	this.f_layers=null;
	this.f_autoFadeIn=false;
	this.f_autoFadeInTime=50.0;
	this.f_autoFadeInSound=false;
	this.f_autoFadeInMusic=false;
	this.f_musicPath="";
	this.f_musicFlag=0;
}
function bb_framework_Screen_new(){
	return this;
}
bb_framework_Screen.prototype.m_RenderBackgroundLayers=function(){
	if((this.f_layers)!=null){
		var t_=this.f_layers.m_ObjectEnumerator();
		while(t_.m_HasNext()){
			var t_layer=t_.m_NextObject();
			if(t_layer.f_index>=0){
				return;
			}
			t_layer.m_Render2(0.0,0.0);
		}
	}
}
bb_framework_Screen.prototype.m_Render=function(){
}
bb_framework_Screen.prototype.m_RenderForegroundLayers=function(){
	if((this.f_layers)!=null){
		var t_=this.f_layers.m_ObjectEnumerator();
		while(t_.m_HasNext()){
			var t_layer=t_.m_NextObject();
			if(t_layer.f_index>=0){
				t_layer.m_Render2(0.0,0.0);
			}
		}
	}
}
bb_framework_Screen.prototype.m_ExtraRender=function(){
}
bb_framework_Screen.prototype.m_DebugRender=function(){
}
bb_framework_Screen.prototype.m_OnTouchHit=function(t_x,t_y,t_pointer){
}
bb_framework_Screen.prototype.m_OnTouchClick=function(t_x,t_y,t_pointer){
}
bb_framework_Screen.prototype.m_OnTouchFling=function(t_releaseX,t_releaseY,t_velocityX,t_velocityY,t_velocitySpeed,t_pointer){
}
bb_framework_Screen.prototype.m_OnTouchReleased=function(t_x,t_y,t_pointer){
}
bb_framework_Screen.prototype.m_OnTouchDragged=function(t_x,t_y,t_dx,t_dy,t_pointer){
}
bb_framework_Screen.prototype.m_OnTouchLongPress=function(t_x,t_y,t_pointer){
}
bb_framework_Screen.prototype.m_OnAnyKeyHit=function(){
}
bb_framework_Screen.prototype.m_OnKeyHit=function(t_key){
}
bb_framework_Screen.prototype.m_OnAnyKeyDown=function(){
}
bb_framework_Screen.prototype.m_OnKeyDown=function(t_key){
}
bb_framework_Screen.prototype.m_OnAnyKeyReleased=function(){
}
bb_framework_Screen.prototype.m_OnKeyReleased=function(t_key){
}
bb_framework_Screen.prototype.m_OnMouseHit=function(t_x,t_y,t_button){
}
bb_framework_Screen.prototype.m_OnMouseDown=function(t_x,t_y,t_button){
}
bb_framework_Screen.prototype.m_OnMouseReleased=function(t_x,t_y,t_button){
}
bb_framework_Screen.prototype.m_Kill=function(){
}
bb_framework_Screen.prototype.m_Start2=function(){
}
bb_framework_Screen.prototype.m_PreStart=function(){
	bb_framework_game.f_currentScreen=this;
	if(this.f_autoFadeIn){
		this.f_autoFadeIn=false;
		bb_framework_game.f_screenFade.m_Start3(this.f_autoFadeInTime,false,this.f_autoFadeInSound,this.f_autoFadeInMusic,true);
	}
	var t_tmpImage=null;
	var t_=bb_framework_game.f_images.m_Keys().m_ObjectEnumerator();
	while(t_.m_HasNext()){
		var t_key=t_.m_NextObject();
		var t_i=bb_framework_game.f_images.m_Get(t_key);
		if(t_i.f_preLoad && t_i.f_screenName.toUpperCase()==this.f_name.toUpperCase()){
			if(t_i.f_frames>1){
				t_i.m_LoadAnim(t_i.f_path,t_i.f_w,t_i.f_h,t_i.f_frames,t_tmpImage,t_i.f_midhandle,t_i.f_readPixels,t_i.f_maskRed,t_i.f_maskGreen,t_i.f_maskBlue,false,t_i.f_screenName);
			}else{
				t_i.m_Load(t_i.f_path,t_i.f_midhandle,t_i.f_readPixels,t_i.f_maskRed,t_i.f_maskGreen,t_i.f_maskBlue,false,t_i.f_screenName);
			}
		}
	}
	var t_2=bb_framework_game.f_sounds.m_Keys().m_ObjectEnumerator();
	while(t_2.m_HasNext()){
		var t_key2=t_2.m_NextObject();
		var t_i2=bb_framework_game.f_sounds.m_Get(t_key2);
		if(t_i2.f_preLoad && t_i2.f_screenName.toUpperCase()==this.f_name.toUpperCase()){
			t_i2.m_Load2(t_i2.f_path,false,t_i2.f_screenName);
		}
	}
	if(this.f_musicPath!=""){
		bb_framework_game.m_MusicPlay(this.f_musicPath,this.f_musicFlag);
	}
	this.m_Start2();
}
bb_framework_Screen.prototype.m_PostFadeOut=function(){
	this.m_Kill();
	bb_framework_game.f_nextScreen.m_PreStart();
}
bb_framework_Screen.prototype.m_PostFadeIn=function(){
}
bb_framework_Screen.prototype.m_Update2=function(){
}
bb_framework_Screen.prototype.m_Suspend=function(){
}
bb_framework_Screen.prototype.m_Resume=function(){
}
bb_framework_Screen.prototype.m_FadeToScreen=function(t_screen,t_fadeTime,t_fadeSound,t_fadeMusic,t_allowScreenUpdate){
	if(bb_framework_game.f_screenFade.f_active){
		return;
	}
	if(!((t_screen)!=null)){
		t_screen=(bb_framework_game.f_exitScreen);
	}
	t_screen.f_autoFadeIn=true;
	t_screen.f_autoFadeInTime=t_fadeTime;
	t_screen.f_autoFadeInSound=t_fadeSound;
	t_screen.f_autoFadeInMusic=t_fadeMusic;
	bb_framework_game.f_nextScreen=t_screen;
	bb_framework_game.f_screenFade.m_Start3(t_fadeTime,true,t_fadeSound,t_fadeMusic,t_allowScreenUpdate);
}
function bb_framework_ExitScreen(){
	bb_framework_Screen.call(this);
}
bb_framework_ExitScreen.prototype=extend_class(bb_framework_Screen);
function bb_framework_ExitScreen_new(){
	bb_framework_Screen_new.call(this);
	this.f_name="exit";
	return this;
}
bb_framework_ExitScreen.prototype.m_Start2=function(){
	bb_functions_ExitApp();
}
bb_framework_ExitScreen.prototype.m_Render=function(){
}
bb_framework_ExitScreen.prototype.m_Update2=function(){
}
function bb_framework_ScreenFade(){
	Object.call(this);
	this.f_active=false;
	this.f_ratio=0.0;
	this.f_counter=.0;
	this.f_fadeTime=.0;
	this.f_fadeMusic=false;
	this.f_fadeOut=false;
	this.f_fadeSound=false;
	this.f_allowScreenUpdate=false;
}
function bb_framework_ScreenFade_new(){
	return this;
}
bb_framework_ScreenFade.prototype.m_Render=function(){
	if(!this.f_active){
		return;
	}
	bb_graphics_SetAlpha(1.0-this.f_ratio);
	bb_graphics_SetColor(0.0,0.0,0.0);
	bb_graphics_DrawRect(0.0,0.0,bb_framework_DEVICE_WIDTH,bb_framework_DEVICE_HEIGHT);
	bb_graphics_SetAlpha(1.0);
	bb_graphics_SetColor(255.0,255.0,255.0);
}
bb_framework_ScreenFade.prototype.m_CalcRatio=function(){
	this.f_ratio=this.f_counter/this.f_fadeTime;
	if(this.f_ratio<0.0){
		this.f_ratio=0.0;
		if(this.f_fadeMusic){
			bb_framework_game.m_SetMojoMusicVolume(0.0);
		}
	}
	if(this.f_ratio>1.0){
		this.f_ratio=1.0;
		if(this.f_fadeMusic){
			bb_framework_game.m_SetMojoMusicVolume((bb_framework_game.f_musicVolume)/100.0);
		}
	}
	if(this.f_fadeOut){
		this.f_ratio=1.0-this.f_ratio;
	}
}
bb_framework_ScreenFade.prototype.m_Start3=function(t_fadeTime,t_fadeOut,t_fadeSound,t_fadeMusic,t_allowScreenUpdate){
	if(this.f_active){
		return;
	}
	this.f_active=true;
	this.f_fadeTime=bb_framework_game.m_CalcAnimLength((t_fadeTime)|0);
	this.f_fadeOut=t_fadeOut;
	this.f_fadeMusic=t_fadeMusic;
	this.f_fadeSound=t_fadeSound;
	this.f_allowScreenUpdate=t_allowScreenUpdate;
	if(t_fadeOut){
		this.f_ratio=1.0;
	}else{
		this.f_ratio=0.0;
		if(this.f_fadeMusic){
			bb_framework_game.m_SetMojoMusicVolume(0.0);
		}
	}
	this.f_counter=0.0;
}
bb_framework_ScreenFade.prototype.m_Update2=function(){
	if(!this.f_active){
		return;
	}
	this.f_counter+=bb_framework_dt.f_delta;
	this.m_CalcRatio();
	if(this.f_fadeSound){
		for(var t_i=0;t_i<=31;t_i=t_i+1){
			bb_audio_SetChannelVolume(t_i,this.f_ratio*((bb_framework_game.f_soundVolume)/100.0));
		}
	}
	if(this.f_fadeMusic){
		bb_framework_game.m_SetMojoMusicVolume(this.f_ratio*((bb_framework_game.f_musicVolume)/100.0));
	}
	if(this.f_counter>this.f_fadeTime){
		this.f_active=false;
		if(this.f_fadeOut){
			bb_framework_game.f_currentScreen.m_PostFadeOut();
		}else{
			bb_framework_game.f_currentScreen.m_PostFadeIn();
		}
	}
}
function bb_framework_GameImage(){
	Object.call(this);
	this.f_image=null;
	this.f_w=0;
	this.f_h=0;
	this.f_preLoad=false;
	this.f_screenName="";
	this.f_frames=0;
	this.f_path="";
	this.f_midhandle=false;
	this.f_readPixels=false;
	this.f_maskRed=0;
	this.f_maskGreen=0;
	this.f_maskBlue=0;
	this.f_name="";
	this.f_w2=.0;
	this.f_h2=.0;
	this.f_midhandled=0;
	this.f_pixels=[];
}
bb_framework_GameImage.prototype.m_Draw=function(t_x,t_y,t_rotation,t_scaleX,t_scaleY,t_frame){
	bb_graphics_DrawImage2(this.f_image,t_x,t_y,t_rotation,t_scaleX,t_scaleY,t_frame);
}
bb_framework_GameImage.prototype.m_CalcSize=function(){
	if(this.f_image!=null){
		this.f_w=this.f_image.m_Width();
		this.f_h=this.f_image.m_Height();
		this.f_w2=((this.f_w/2)|0);
		this.f_h2=((this.f_h/2)|0);
	}
}
bb_framework_GameImage.prototype.m_MidHandle=function(t_midhandle){
	if(t_midhandle){
		this.f_image.m_SetHandle(this.f_w2,this.f_h2);
		this.f_midhandled=1;
	}else{
		this.f_image.m_SetHandle(0.0,0.0);
		this.f_midhandled=0;
	}
}
bb_framework_GameImage.prototype.m_MidHandle2=function(){
	return this.f_midhandled==1;
}
bb_framework_GameImage.prototype.m_SetMaskColor=function(t_r,t_g,t_b){
	this.f_maskRed=t_r;
	this.f_maskGreen=t_g;
	this.f_maskBlue=t_b;
}
bb_framework_GameImage.prototype.m_LoadAnim=function(t_file,t_w,t_h,t_total,t_tmpImage,t_midhandle,t_readPixels,t_maskRed,t_maskGreen,t_maskBlue,t_preLoad,t_screenName){
	this.f_name=bb_functions_StripAll(t_file.toUpperCase());
	this.f_path=t_file;
	this.f_midhandle=t_midhandle;
	this.f_preLoad=t_preLoad;
	this.f_screenName=t_screenName.toUpperCase();
	this.f_w=t_w;
	this.f_h=t_h;
	this.f_frames=t_total;
	if(!t_preLoad){
		this.f_image=bb_functions_LoadAnimBitmap(t_file,t_w,t_h,t_total,t_tmpImage);
		this.m_CalcSize();
		this.m_MidHandle(t_midhandle);
		this.f_pixels=new_number_array(this.f_image.m_Width()*this.f_image.m_Height());
		this.f_readPixels=t_readPixels;
	}
	this.m_SetMaskColor(t_maskRed,t_maskGreen,t_maskBlue);
}
bb_framework_GameImage.prototype.m_Load=function(t_file,t_midhandle,t_readPixels,t_maskRed,t_maskGreen,t_maskBlue,t_preLoad,t_screenName){
	this.f_name=bb_functions_StripAll(t_file.toUpperCase());
	this.f_path=t_file;
	this.f_midhandle=t_midhandle;
	this.f_preLoad=t_preLoad;
	this.f_screenName=t_screenName.toUpperCase();
	if(!t_preLoad){
		this.f_image=bb_functions_LoadBitmap(t_file,0);
		this.m_CalcSize();
		this.m_MidHandle(t_midhandle);
		this.f_pixels=new_number_array(this.f_image.m_Width()*this.f_image.m_Height());
		this.f_readPixels=t_readPixels;
	}
	this.m_SetMaskColor(t_maskRed,t_maskGreen,t_maskBlue);
}
function bb_map_Map2(){
	Object.call(this);
	this.f_root=null;
}
function bb_map_Map2_new(){
	return this;
}
bb_map_Map2.prototype.m_Keys=function(){
	return bb_map_MapKeys_new.call(new bb_map_MapKeys,this);
}
bb_map_Map2.prototype.m_FirstNode=function(){
	if(!((this.f_root)!=null)){
		return null;
	}
	var t_node=this.f_root;
	while((t_node.f_left)!=null){
		t_node=t_node.f_left;
	}
	return t_node;
}
bb_map_Map2.prototype.m_Compare=function(t_lhs,t_rhs){
}
bb_map_Map2.prototype.m_FindNode=function(t_key){
	var t_node=this.f_root;
	while((t_node)!=null){
		var t_cmp=this.m_Compare(t_key,t_node.f_key);
		if(t_cmp>0){
			t_node=t_node.f_right;
		}else{
			if(t_cmp<0){
				t_node=t_node.f_left;
			}else{
				return t_node;
			}
		}
	}
	return t_node;
}
bb_map_Map2.prototype.m_Get=function(t_key){
	var t_node=this.m_FindNode(t_key);
	if((t_node)!=null){
		return t_node.f_value;
	}
	return null;
}
function bb_map_StringMap2(){
	bb_map_Map2.call(this);
}
bb_map_StringMap2.prototype=extend_class(bb_map_Map2);
function bb_map_StringMap2_new(){
	bb_map_Map2_new.call(this);
	return this;
}
bb_map_StringMap2.prototype.m_Compare=function(t_lhs,t_rhs){
	return string_compare(t_lhs,t_rhs);
}
function bb_framework_ImageBank(){
	bb_map_StringMap2.call(this);
}
bb_framework_ImageBank.prototype=extend_class(bb_map_StringMap2);
function bb_framework_ImageBank_new(){
	bb_map_StringMap2_new.call(this);
	return this;
}
bb_framework_ImageBank.prototype.m_Find=function(t_name){
	t_name=t_name.toUpperCase();
	if(bb_framework_game.f_debugOn){
		var t_=this.m_Keys().m_ObjectEnumerator();
		while(t_.m_HasNext()){
			var t_key=t_.m_NextObject();
			var t_i=this.m_Get(t_key);
			if(!t_i.f_preLoad){
				print(t_key+" is stored in the image map.");
			}
		}
	}
	var t_i2=this.m_Get(t_name);
	bb_assert_AssertNotNull((t_i2),"Image '"+t_name+"' not found in the ImageBank");
	if(t_i2.f_preLoad && t_i2.f_image==null){
		bb_assert_AssertError("Image '"+t_name+"' not found in the ImageBank");
	}
	return t_i2;
}
function bb_framework_GameSound(){
	Object.call(this);
	this.f_preLoad=false;
	this.f_screenName="";
	this.f_path="";
	this.f_sound=null;
	this.f_name="";
}
bb_framework_GameSound.prototype.m_Load2=function(t_file,t_preLoad,t_screenName){
	this.f_path=t_file;
	this.f_preLoad=t_preLoad;
	this.f_screenName=t_screenName;
	if(!t_preLoad){
		if((t_file.indexOf(".wav")!=-1) || (t_file.indexOf(".ogg")!=-1) || (t_file.indexOf(".mp3")!=-1) || (t_file.indexOf(".m4a")!=-1) || (t_file.indexOf(".wma")!=-1)){
			this.f_sound=bb_functions_LoadSoundSample(bb_framework_SoundBank_path+t_file);
		}else{
			this.f_sound=bb_functions_LoadSoundSample(bb_framework_SoundBank_path+t_file+".wav");
		}
	}
	this.f_name=bb_functions_StripAll(t_file.toUpperCase());
}
function bb_map_Map3(){
	Object.call(this);
	this.f_root=null;
}
function bb_map_Map3_new(){
	return this;
}
bb_map_Map3.prototype.m_Keys=function(){
	return bb_map_MapKeys2_new.call(new bb_map_MapKeys2,this);
}
bb_map_Map3.prototype.m_FirstNode=function(){
	if(!((this.f_root)!=null)){
		return null;
	}
	var t_node=this.f_root;
	while((t_node.f_left)!=null){
		t_node=t_node.f_left;
	}
	return t_node;
}
bb_map_Map3.prototype.m_Compare=function(t_lhs,t_rhs){
}
bb_map_Map3.prototype.m_FindNode=function(t_key){
	var t_node=this.f_root;
	while((t_node)!=null){
		var t_cmp=this.m_Compare(t_key,t_node.f_key);
		if(t_cmp>0){
			t_node=t_node.f_right;
		}else{
			if(t_cmp<0){
				t_node=t_node.f_left;
			}else{
				return t_node;
			}
		}
	}
	return t_node;
}
bb_map_Map3.prototype.m_Get=function(t_key){
	var t_node=this.m_FindNode(t_key);
	if((t_node)!=null){
		return t_node.f_value;
	}
	return null;
}
function bb_map_StringMap3(){
	bb_map_Map3.call(this);
}
bb_map_StringMap3.prototype=extend_class(bb_map_Map3);
function bb_map_StringMap3_new(){
	bb_map_Map3_new.call(this);
	return this;
}
bb_map_StringMap3.prototype.m_Compare=function(t_lhs,t_rhs){
	return string_compare(t_lhs,t_rhs);
}
function bb_framework_SoundBank(){
	bb_map_StringMap3.call(this);
}
bb_framework_SoundBank.prototype=extend_class(bb_map_StringMap3);
function bb_framework_SoundBank_new(){
	bb_map_StringMap3_new.call(this);
	return this;
}
var bb_framework_SoundBank_path;
function bb_map_Map4(){
	Object.call(this);
}
function bb_map_Map4_new(){
	return this;
}
function bb_map_StringMap4(){
	bb_map_Map4.call(this);
}
bb_map_StringMap4.prototype=extend_class(bb_map_Map4);
function bb_map_StringMap4_new(){
	bb_map_Map4_new.call(this);
	return this;
}
function bb_framework_Screens(){
	bb_map_StringMap4.call(this);
}
bb_framework_Screens.prototype=extend_class(bb_map_StringMap4);
function bb_framework_Screens_new(){
	bb_map_StringMap4_new.call(this);
	return this;
}
function bb_inputcache_InputCache(){
	Object.call(this);
	this.f_keyHitEnumerator=null;
	this.f_keyDownEnumerator=null;
	this.f_keyReleasedEnumerator=null;
	this.f_keyHitWrapper=null;
	this.f_keyDownWrapper=null;
	this.f_keyReleasedWrapper=null;
	this.f_touchData=new_object_array(32);
	this.f_monitorTouch=false;
	this.f_monitorMouse=false;
	this.f_touchDownCount=0;
	this.f_touchHitCount=0;
	this.f_touchReleasedCount=0;
	this.f_maxTouchDown=-1;
	this.f_maxTouchHit=-1;
	this.f_maxTouchReleased=-1;
	this.f_minTouchDown=-1;
	this.f_minTouchHit=-1;
	this.f_minTouchReleased=-1;
	this.f_touchHit=new_number_array(32);
	this.f_touchHitTime=new_number_array(32);
	this.f_touchDown=new_number_array(32);
	this.f_touchDownTime=new_number_array(32);
	this.f_touchReleasedTime=new_number_array(32);
	this.f_touchReleased=new_number_array(32);
	this.f_touchX=new_number_array(32);
	this.f_touchY=new_number_array(32);
	this.f_currentTouchDown=new_number_array(32);
	this.f_currentTouchHit=new_number_array(32);
	this.f_currentTouchReleased=new_number_array(32);
	this.f_mouseDownCount=0;
	this.f_mouseHitCount=0;
	this.f_mouseReleasedCount=0;
	this.f_mouseX=0;
	this.f_mouseY=0;
	this.f_mouseHit=new_number_array(3);
	this.f_mouseHitTime=new_number_array(3);
	this.f_mouseDown=new_number_array(3);
	this.f_mouseDownTime=new_number_array(3);
	this.f_mouseReleasedTime=new_number_array(3);
	this.f_mouseReleased=new_number_array(3);
	this.f_currentMouseDown=new_number_array(3);
	this.f_currentMouseHit=new_number_array(3);
	this.f_currentMouseReleased=new_number_array(3);
	this.f_keyDownCount=0;
	this.f_keyHitCount=0;
	this.f_keyReleasedCount=0;
	this.f_monitorKeyCount=0;
	this.f_monitorKey=new_bool_array(512);
	this.f_keyHit=new_number_array(512);
	this.f_keyHitTime=new_number_array(512);
	this.f_keyDown=new_number_array(512);
	this.f_keyDownTime=new_number_array(512);
	this.f_keyReleasedTime=new_number_array(512);
	this.f_keyReleased=new_number_array(512);
	this.f_currentKeysDown=new_number_array(512);
	this.f_currentKeysHit=new_number_array(512);
	this.f_currentKeysReleased=new_number_array(512);
	this.f_flingThreshold=250.0;
	this.f_longPressTime=1000;
}
function bb_inputcache_InputCache_new(){
	this.f_keyHitEnumerator=bb_inputcache_KeyEventEnumerator_new.call(new bb_inputcache_KeyEventEnumerator,this,3);
	this.f_keyDownEnumerator=bb_inputcache_KeyEventEnumerator_new.call(new bb_inputcache_KeyEventEnumerator,this,1);
	this.f_keyReleasedEnumerator=bb_inputcache_KeyEventEnumerator_new.call(new bb_inputcache_KeyEventEnumerator,this,2);
	this.f_keyHitWrapper=bb_inputcache_EnumWrapper_new.call(new bb_inputcache_EnumWrapper,this.f_keyHitEnumerator);
	this.f_keyDownWrapper=bb_inputcache_EnumWrapper_new.call(new bb_inputcache_EnumWrapper,this.f_keyDownEnumerator);
	this.f_keyReleasedWrapper=bb_inputcache_EnumWrapper_new.call(new bb_inputcache_EnumWrapper,this.f_keyReleasedEnumerator);
	for(var t_i=0;t_i<this.f_touchData.length;t_i=t_i+1){
		this.f_touchData[t_i]=bb_inputcache_TouchData_new.call(new bb_inputcache_TouchData);
	}
	this.f_monitorTouch=false;
	this.f_monitorMouse=true;
	return this;
}
bb_inputcache_InputCache.prototype.m_ReadInput=function(){
	var t_newval=0;
	var t_now=bb_app_Millisecs();
	if(this.f_monitorTouch){
		this.f_touchDownCount=0;
		this.f_touchHitCount=0;
		this.f_touchReleasedCount=0;
		this.f_maxTouchDown=-1;
		this.f_maxTouchHit=-1;
		this.f_maxTouchReleased=-1;
		this.f_minTouchDown=-1;
		this.f_minTouchHit=-1;
		this.f_minTouchReleased=-1;
		for(var t_i=0;t_i<32;t_i=t_i+1){
			t_newval=bb_input_TouchHit(t_i);
			if(!((this.f_touchHit[t_i])!=0) && ((t_newval)!=0)){
				this.f_touchHitTime[t_i]=t_now;
			}
			this.f_touchHit[t_i]=t_newval;
			t_newval=bb_input_TouchDown(t_i);
			if(((t_newval)!=0) && !((this.f_touchDown[t_i])!=0)){
				this.f_touchDownTime[t_i]=t_now;
			}
			if(((this.f_touchDown[t_i])!=0) && !((t_newval)!=0)){
				this.f_touchReleasedTime[t_i]=t_now;
				this.f_touchReleased[t_i]=1;
			}else{
				this.f_touchReleased[t_i]=0;
			}
			this.f_touchDown[t_i]=t_newval;
			this.f_touchX[t_i]=bb_input_TouchX(t_i);
			this.f_touchY[t_i]=bb_input_TouchY(t_i);
			if((this.f_touchDown[t_i])!=0){
				this.f_currentTouchDown[this.f_touchDownCount]=t_i;
				this.f_touchDownCount+=1;
				if(this.f_minTouchDown<0){
					this.f_minTouchDown=t_i;
				}
				this.f_maxTouchDown=t_i;
			}
			if((this.f_touchHit[t_i])!=0){
				this.f_currentTouchHit[this.f_touchHitCount]=t_i;
				this.f_touchHitCount+=1;
				if(this.f_minTouchHit<0){
					this.f_minTouchHit=t_i;
				}
				this.f_maxTouchHit=t_i;
			}
			if((this.f_touchReleased[t_i])!=0){
				this.f_currentTouchReleased[this.f_touchReleasedCount]=t_i;
				this.f_touchReleasedCount+=1;
				if(this.f_minTouchReleased<0){
					this.f_minTouchReleased=t_i;
				}
				this.f_maxTouchReleased=t_i;
			}
		}
	}
	if(this.f_monitorMouse){
		this.f_mouseDownCount=0;
		this.f_mouseHitCount=0;
		this.f_mouseReleasedCount=0;
		this.f_mouseX=bb_framework_game.f_mouseX;
		this.f_mouseY=bb_framework_game.f_mouseY;
		for(var t_i2=0;t_i2<3;t_i2=t_i2+1){
			t_newval=bb_input_MouseHit(t_i2);
			if(!((this.f_mouseHit[t_i2])!=0) && ((t_newval)!=0)){
				this.f_mouseHitTime[t_i2]=t_now;
			}
			this.f_mouseHit[t_i2]=t_newval;
			t_newval=bb_input_MouseDown(t_i2);
			if(((t_newval)!=0) && !((this.f_mouseDown[t_i2])!=0)){
				this.f_mouseDownTime[t_i2]=t_now;
			}
			if(((this.f_mouseDown[t_i2])!=0) && !((t_newval)!=0)){
				this.f_mouseReleasedTime[t_i2]=t_now;
				this.f_mouseReleased[t_i2]=1;
			}else{
				this.f_mouseReleased[t_i2]=0;
			}
			this.f_mouseDown[t_i2]=t_newval;
			if((this.f_mouseDown[t_i2])!=0){
				this.f_currentMouseDown[this.f_mouseDownCount]=t_i2;
				this.f_mouseDownCount+=1;
			}
			if((this.f_mouseHit[t_i2])!=0){
				this.f_currentMouseHit[this.f_mouseHitCount]=t_i2;
				this.f_mouseHitCount+=1;
			}
			if((this.f_mouseReleased[t_i2])!=0){
				this.f_currentMouseReleased[this.f_mouseReleasedCount]=t_i2;
				this.f_mouseReleasedCount+=1;
			}
		}
	}
	this.f_keyDownCount=0;
	this.f_keyHitCount=0;
	this.f_keyReleasedCount=0;
	if(this.f_monitorKeyCount>0){
		for(var t_i3=8;t_i3<=222;t_i3=t_i3+1){
			if(this.f_monitorKey[t_i3]){
				t_newval=bb_input_KeyHit(t_i3);
				if(!((this.f_keyHit[t_i3])!=0) && ((t_newval)!=0)){
					this.f_keyHitTime[t_i3]=t_now;
				}
				this.f_keyHit[t_i3]=t_newval;
				t_newval=bb_input_KeyDown(t_i3);
				if(((t_newval)!=0) && !((this.f_keyDown[t_i3])!=0)){
					this.f_keyDownTime[t_i3]=t_now;
				}
				if(((this.f_keyDown[t_i3])!=0) && !((t_newval)!=0)){
					this.f_keyReleasedTime[t_i3]=t_now;
					this.f_keyReleased[t_i3]=1;
				}else{
					this.f_keyReleased[t_i3]=0;
				}
				this.f_keyDown[t_i3]=t_newval;
				if((this.f_keyDown[t_i3])!=0){
					this.f_currentKeysDown[this.f_keyDownCount]=t_i3;
					this.f_keyDownCount+=1;
				}
				if((this.f_keyHit[t_i3])!=0){
					this.f_currentKeysHit[this.f_keyHitCount]=t_i3;
					this.f_keyHitCount+=1;
				}
				if((this.f_keyReleased[t_i3])!=0){
					this.f_currentKeysReleased[this.f_keyReleasedCount]=t_i3;
					this.f_keyReleasedCount+=1;
				}
			}
		}
	}
}
bb_inputcache_InputCache.prototype.m_HandleEvents=function(t_screen){
	for(var t_i=0;t_i<this.f_touchHitCount;t_i=t_i+1){
		var t_pointer=this.f_currentTouchHit[t_i];
		var t_x=((this.f_touchX[t_pointer])|0);
		var t_y=((this.f_touchY[t_pointer])|0);
		this.f_touchData[t_pointer].m_Reset(t_x,t_y);
		t_screen.m_OnTouchHit(t_x,t_y,t_pointer);
	}
	for(var t_i2=0;t_i2<this.f_touchReleasedCount;t_i2=t_i2+1){
		var t_pointer2=this.f_currentTouchReleased[t_i2];
		var t_x2=((this.f_touchX[t_pointer2])|0);
		var t_y2=((this.f_touchY[t_pointer2])|0);
		this.f_touchData[t_pointer2].m_Update3(t_x2,t_y2);
		if(!this.f_touchData[t_pointer2].f_movedTooFar && !this.f_touchData[t_pointer2].f_firedLongPress){
			t_screen.m_OnTouchClick(t_x2,t_y2,t_pointer2);
		}else{
			if(this.f_touchData[t_pointer2].f_touchVelocityX*this.f_touchData[t_pointer2].f_touchVelocityX+this.f_touchData[t_pointer2].f_touchVelocityY*this.f_touchData[t_pointer2].f_touchVelocityY>=this.f_flingThreshold*this.f_flingThreshold){
				t_screen.m_OnTouchFling(t_x2,t_y2,this.f_touchData[t_pointer2].f_touchVelocityX,this.f_touchData[t_pointer2].f_touchVelocityY,this.f_touchData[t_pointer2].f_touchVelocitySpeed,t_pointer2);
			}
		}
		t_screen.m_OnTouchReleased(t_x2,t_y2,t_pointer2);
	}
	for(var t_i3=0;t_i3<this.f_touchDownCount;t_i3=t_i3+1){
		var t_pointer3=this.f_currentTouchDown[t_i3];
		var t_x3=((this.f_touchX[t_pointer3])|0);
		var t_y3=((this.f_touchY[t_pointer3])|0);
		this.f_touchData[t_pointer3].m_Update3(t_x3,t_y3);
		t_screen.m_OnTouchDragged(t_x3,t_y3,this.f_touchData[t_pointer3].f_distanceMovedX,this.f_touchData[t_pointer3].f_distanceMovedY,t_pointer3);
		if(!this.f_touchData[t_pointer3].f_testedLongPress && bb_framework_dt.f_currentticks-(this.f_touchData[t_pointer3].f_firstTouchTime)>=(this.f_longPressTime)){
			this.f_touchData[t_pointer3].f_testedLongPress=true;
			if(!this.f_touchData[t_pointer3].f_movedTooFar){
				t_screen.m_OnTouchLongPress(t_x3,t_y3,t_pointer3);
				this.f_touchData[t_pointer3].f_firedLongPress=true;
			}
		}
	}
	if(this.f_keyHitCount>0){
		t_screen.m_OnAnyKeyHit();
	}
	for(var t_i4=0;t_i4<this.f_keyHitCount;t_i4=t_i4+1){
		var t_key=this.f_currentKeysHit[t_i4];
		t_screen.m_OnKeyHit(t_key);
	}
	if(this.f_keyDownCount>0){
		t_screen.m_OnAnyKeyDown();
	}
	for(var t_i5=0;t_i5<this.f_keyDownCount;t_i5=t_i5+1){
		var t_key2=this.f_currentKeysDown[t_i5];
		t_screen.m_OnKeyDown(t_key2);
	}
	if(this.f_keyReleasedCount>0){
		t_screen.m_OnAnyKeyReleased();
	}
	for(var t_i6=0;t_i6<this.f_keyReleasedCount;t_i6=t_i6+1){
		var t_key3=this.f_currentKeysReleased[t_i6];
		t_screen.m_OnKeyReleased(t_key3);
	}
	for(var t_i7=0;t_i7<this.f_mouseHitCount;t_i7=t_i7+1){
		var t_button=this.f_currentMouseHit[t_i7];
		var t_x4=this.f_mouseX;
		var t_y4=this.f_mouseY;
		t_screen.m_OnMouseHit(t_x4,t_y4,t_button);
	}
	for(var t_i8=0;t_i8<this.f_mouseDownCount;t_i8=t_i8+1){
		var t_button2=this.f_currentMouseDown[t_i8];
		var t_x5=this.f_mouseX;
		var t_y5=this.f_mouseY;
		t_screen.m_OnMouseDown(t_x5,t_y5,t_button2);
	}
	for(var t_i9=0;t_i9<this.f_mouseReleasedCount;t_i9=t_i9+1){
		var t_button3=this.f_currentMouseReleased[t_i9];
		var t_x6=this.f_mouseX;
		var t_y6=this.f_mouseY;
		t_screen.m_OnMouseReleased(t_x6,t_y6,t_button3);
	}
}
function bb_inputcache_InputEventEnumerator(){
	Object.call(this);
	this.f_ic=null;
	this.f_eventType=0;
}
function bb_inputcache_InputEventEnumerator_new(t_ic,t_eventType){
	this.f_ic=t_ic;
	this.f_eventType=t_eventType;
	return this;
}
function bb_inputcache_InputEventEnumerator_new2(){
	return this;
}
function bb_inputcache_KeyEventEnumerator(){
	bb_inputcache_InputEventEnumerator.call(this);
	this.f_event=null;
}
bb_inputcache_KeyEventEnumerator.prototype=extend_class(bb_inputcache_InputEventEnumerator);
function bb_inputcache_KeyEventEnumerator_new(t_ic,t_eventType){
	bb_inputcache_InputEventEnumerator_new.call(this,t_ic,t_eventType);
	this.f_event=bb_inputcache_KeyEvent_new2.call(new bb_inputcache_KeyEvent);
	return this;
}
function bb_inputcache_KeyEventEnumerator_new2(){
	bb_inputcache_InputEventEnumerator_new2.call(this);
	return this;
}
function bb_inputcache_InputEvent(){
	Object.call(this);
	this.f_eventType=0;
}
function bb_inputcache_InputEvent_new(t_eventType){
	this.f_eventType=t_eventType;
	return this;
}
function bb_inputcache_InputEvent_new2(){
	return this;
}
function bb_inputcache_KeyEvent(){
	bb_inputcache_InputEvent.call(this);
}
bb_inputcache_KeyEvent.prototype=extend_class(bb_inputcache_InputEvent);
function bb_inputcache_KeyEvent_new(t_eventType){
	bb_inputcache_InputEvent_new.call(this,t_eventType);
	return this;
}
function bb_inputcache_KeyEvent_new2(){
	bb_inputcache_InputEvent_new2.call(this);
	return this;
}
function bb_inputcache_EnumWrapper(){
	Object.call(this);
	this.f_wrappedEnum=null;
}
function bb_inputcache_EnumWrapper_new(t_wrappedEnum){
	this.f_wrappedEnum=t_wrappedEnum;
	return this;
}
function bb_inputcache_EnumWrapper_new2(){
	return this;
}
function bb_inputcache_TouchData(){
	Object.call(this);
	this.f_firstTouchX=0;
	this.f_firstTouchY=0;
	this.f_lastTouchX=0;
	this.f_lastTouchY=0;
	this.f_firstTouchTime=0;
	this.f_testedLongPress=false;
	this.f_firedLongPress=false;
	this.f_flingSamplesX=new_number_array(10);
	this.f_flingSamplesY=new_number_array(10);
	this.f_flingSamplesTime=new_number_array(10);
	this.f_flingSampleCount=0;
	this.f_flingSampleNext=0;
	this.f_movedTooFar=false;
	this.f_touchVelocityX=.0;
	this.f_touchVelocityY=.0;
	this.f_touchVelocitySpeed=.0;
	this.f_distanceMovedX=0;
	this.f_distanceMovedY=0;
}
function bb_inputcache_TouchData_new(){
	return this;
}
bb_inputcache_TouchData.prototype.m_AddFlingSample=function(t_x,t_y){
	this.f_flingSamplesX[this.f_flingSampleNext]=t_x;
	this.f_flingSamplesY[this.f_flingSampleNext]=t_y;
	this.f_flingSamplesTime[this.f_flingSampleNext]=((bb_framework_dt.f_currentticks)|0);
	if(this.f_flingSampleCount<10){
		this.f_flingSampleCount+=1;
	}
	this.f_flingSampleNext+=1;
	if(this.f_flingSampleNext>=10){
		this.f_flingSampleNext=0;
	}
	var t_first=this.f_flingSampleNext-this.f_flingSampleCount;
	var t_last=this.f_flingSampleNext-1;
	while(t_first<0){
		t_first+=10;
	}
	while(t_last<0){
		t_last+=10;
	}
	if(this.f_flingSampleCount>0){
		var t_secs=(this.f_flingSamplesTime[t_last]-this.f_flingSamplesTime[t_first])/1000.0;
		this.f_touchVelocityX=(this.f_flingSamplesX[t_last]-this.f_flingSamplesX[t_first])/t_secs;
		this.f_touchVelocityY=(this.f_flingSamplesY[t_last]-this.f_flingSamplesY[t_first])/t_secs;
		this.f_touchVelocitySpeed=Math.sqrt(this.f_touchVelocityX*this.f_touchVelocityX+this.f_touchVelocityY*this.f_touchVelocityY);
	}
}
bb_inputcache_TouchData.prototype.m_Reset=function(t_x,t_y){
	this.f_firstTouchX=t_x;
	this.f_firstTouchY=t_y;
	this.f_lastTouchX=t_x;
	this.f_lastTouchY=t_y;
	this.f_firstTouchTime=((bb_framework_dt.f_currentticks)|0);
	this.f_testedLongPress=false;
	this.f_firedLongPress=false;
	for(var t_i=0;t_i<10;t_i=t_i+1){
		this.f_flingSamplesX[t_i]=0;
		this.f_flingSamplesY[t_i]=0;
		this.f_flingSamplesTime[t_i]=0;
	}
	this.f_flingSampleCount=0;
	this.f_flingSampleNext=0;
	this.f_movedTooFar=false;
	this.f_touchVelocityX=0.0;
	this.f_touchVelocityY=0.0;
	this.f_touchVelocitySpeed=0.0;
	this.m_AddFlingSample(t_x,t_y);
}
bb_inputcache_TouchData.prototype.m_Update3=function(t_x,t_y){
	this.f_distanceMovedX=t_x-this.f_lastTouchX;
	this.f_distanceMovedY=t_y-this.f_lastTouchY;
	this.f_lastTouchX=t_x;
	this.f_lastTouchY=t_y;
	this.m_AddFlingSample(t_x,t_y);
	if(!this.f_movedTooFar){
		var t_dx=t_x-this.f_firstTouchX;
		var t_dy=t_y-this.f_firstTouchY;
		if((t_dx*t_dx+t_dy*t_dy)>400.0){
			this.f_movedTooFar=true;
		}
	}
}
function bb_framework_DiddyMouse(){
	Object.call(this);
	this.f_lastX=0;
	this.f_lastY=0;
}
function bb_framework_DiddyMouse_new(){
	diddy.mouseZInit();
	return this;
}
bb_framework_DiddyMouse.prototype.m_Update2=function(){
	this.f_lastX=bb_framework_game.f_mouseX;
	this.f_lastY=bb_framework_game.f_mouseY;
}
function bbMain(){
	bb_pong_PongApp_new.call(new bb_pong_PongApp);
	return 0;
}
function bb_reflection_ConstInfo(){
	Object.call(this);
}
function bb_stack_Stack(){
	Object.call(this);
	this.f_data=[];
	this.f_length=0;
}
function bb_stack_Stack_new(){
	return this;
}
function bb_stack_Stack_new2(t_data){
	this.f_data=t_data.slice(0);
	this.f_length=t_data.length;
	return this;
}
bb_stack_Stack.prototype.m_Push=function(t_value){
	if(this.f_length==this.f_data.length){
		this.f_data=resize_object_array(this.f_data,this.f_length*2+10);
	}
	this.f_data[this.f_length]=t_value;
	this.f_length+=1;
	return 0;
}
bb_stack_Stack.prototype.m_Push2=function(t_values,t_offset,t_count){
	for(var t_i=0;t_i<t_count;t_i=t_i+1){
		this.m_Push(t_values[t_offset+t_i]);
	}
	return 0;
}
bb_stack_Stack.prototype.m_Push3=function(t_values,t_offset){
	for(var t_i=t_offset;t_i<t_values.length;t_i=t_i+1){
		this.m_Push(t_values[t_i]);
	}
	return 0;
}
bb_stack_Stack.prototype.m_ToArray=function(){
	var t_t=new_object_array(this.f_length);
	for(var t_i=0;t_i<this.f_length;t_i=t_i+1){
		t_t[t_i]=this.f_data[t_i];
	}
	return t_t;
}
function bb_reflection_FieldInfo(){
	Object.call(this);
	this.f__name="";
	this.f__attrs=0;
	this.f__type=null;
}
function bb_reflection_FieldInfo_new(t_name,t_attrs,t_type){
	this.f__name=t_name;
	this.f__attrs=t_attrs;
	this.f__type=t_type;
	return this;
}
function bb_reflection_FieldInfo_new2(){
	return this;
}
function bb_stack_Stack2(){
	Object.call(this);
	this.f_data=[];
	this.f_length=0;
}
function bb_stack_Stack2_new(){
	return this;
}
function bb_stack_Stack2_new2(t_data){
	this.f_data=t_data.slice(0);
	this.f_length=t_data.length;
	return this;
}
bb_stack_Stack2.prototype.m_Push4=function(t_value){
	if(this.f_length==this.f_data.length){
		this.f_data=resize_object_array(this.f_data,this.f_length*2+10);
	}
	this.f_data[this.f_length]=t_value;
	this.f_length+=1;
	return 0;
}
bb_stack_Stack2.prototype.m_Push5=function(t_values,t_offset,t_count){
	for(var t_i=0;t_i<t_count;t_i=t_i+1){
		this.m_Push4(t_values[t_offset+t_i]);
	}
	return 0;
}
bb_stack_Stack2.prototype.m_Push6=function(t_values,t_offset){
	for(var t_i=t_offset;t_i<t_values.length;t_i=t_i+1){
		this.m_Push4(t_values[t_i]);
	}
	return 0;
}
bb_stack_Stack2.prototype.m_ToArray=function(){
	var t_t=new_object_array(this.f_length);
	for(var t_i=0;t_i<this.f_length;t_i=t_i+1){
		t_t[t_i]=this.f_data[t_i];
	}
	return t_t;
}
function bb_reflection_GlobalInfo(){
	Object.call(this);
}
function bb_stack_Stack3(){
	Object.call(this);
	this.f_data=[];
	this.f_length=0;
}
function bb_stack_Stack3_new(){
	return this;
}
function bb_stack_Stack3_new2(t_data){
	this.f_data=t_data.slice(0);
	this.f_length=t_data.length;
	return this;
}
bb_stack_Stack3.prototype.m_Push7=function(t_value){
	if(this.f_length==this.f_data.length){
		this.f_data=resize_object_array(this.f_data,this.f_length*2+10);
	}
	this.f_data[this.f_length]=t_value;
	this.f_length+=1;
	return 0;
}
bb_stack_Stack3.prototype.m_Push8=function(t_values,t_offset,t_count){
	for(var t_i=0;t_i<t_count;t_i=t_i+1){
		this.m_Push7(t_values[t_offset+t_i]);
	}
	return 0;
}
bb_stack_Stack3.prototype.m_Push9=function(t_values,t_offset){
	for(var t_i=t_offset;t_i<t_values.length;t_i=t_i+1){
		this.m_Push7(t_values[t_i]);
	}
	return 0;
}
bb_stack_Stack3.prototype.m_ToArray=function(){
	var t_t=new_object_array(this.f_length);
	for(var t_i=0;t_i<this.f_length;t_i=t_i+1){
		t_t[t_i]=this.f_data[t_i];
	}
	return t_t;
}
function bb_reflection_MethodInfo(){
	Object.call(this);
	this.f__name="";
	this.f__attrs=0;
	this.f__retType=null;
	this.f__argTypes=[];
}
function bb_reflection_MethodInfo_new(t_name,t_attrs,t_retType,t_argTypes){
	this.f__name=t_name;
	this.f__attrs=t_attrs;
	this.f__retType=t_retType;
	this.f__argTypes=t_argTypes;
	return this;
}
function bb_reflection_MethodInfo_new2(){
	return this;
}
function bb_stack_Stack4(){
	Object.call(this);
	this.f_data=[];
	this.f_length=0;
}
function bb_stack_Stack4_new(){
	return this;
}
function bb_stack_Stack4_new2(t_data){
	this.f_data=t_data.slice(0);
	this.f_length=t_data.length;
	return this;
}
bb_stack_Stack4.prototype.m_Push10=function(t_value){
	if(this.f_length==this.f_data.length){
		this.f_data=resize_object_array(this.f_data,this.f_length*2+10);
	}
	this.f_data[this.f_length]=t_value;
	this.f_length+=1;
	return 0;
}
bb_stack_Stack4.prototype.m_Push11=function(t_values,t_offset,t_count){
	for(var t_i=0;t_i<t_count;t_i=t_i+1){
		this.m_Push10(t_values[t_offset+t_i]);
	}
	return 0;
}
bb_stack_Stack4.prototype.m_Push12=function(t_values,t_offset){
	for(var t_i=t_offset;t_i<t_values.length;t_i=t_i+1){
		this.m_Push10(t_values[t_i]);
	}
	return 0;
}
bb_stack_Stack4.prototype.m_ToArray=function(){
	var t_t=new_object_array(this.f_length);
	for(var t_i=0;t_i<this.f_length;t_i=t_i+1){
		t_t[t_i]=this.f_data[t_i];
	}
	return t_t;
}
function bb_stack_Stack5(){
	Object.call(this);
	this.f_data=[];
	this.f_length=0;
}
function bb_stack_Stack5_new(){
	return this;
}
function bb_stack_Stack5_new2(t_data){
	this.f_data=t_data.slice(0);
	this.f_length=t_data.length;
	return this;
}
bb_stack_Stack5.prototype.m_Push13=function(t_value){
	if(this.f_length==this.f_data.length){
		this.f_data=resize_object_array(this.f_data,this.f_length*2+10);
	}
	this.f_data[this.f_length]=t_value;
	this.f_length+=1;
	return 0;
}
bb_stack_Stack5.prototype.m_Push14=function(t_values,t_offset,t_count){
	for(var t_i=0;t_i<t_count;t_i=t_i+1){
		this.m_Push13(t_values[t_offset+t_i]);
	}
	return 0;
}
bb_stack_Stack5.prototype.m_Push15=function(t_values,t_offset){
	for(var t_i=t_offset;t_i<t_values.length;t_i=t_i+1){
		this.m_Push13(t_values[t_i]);
	}
	return 0;
}
bb_stack_Stack5.prototype.m_ToArray=function(){
	var t_t=new_object_array(this.f_length);
	for(var t_i=0;t_i<this.f_length;t_i=t_i+1){
		t_t[t_i]=this.f_data[t_i];
	}
	return t_t;
}
function bb_reflection_R19(){
	bb_reflection_FieldInfo.call(this);
}
bb_reflection_R19.prototype=extend_class(bb_reflection_FieldInfo);
function bb_reflection_R19_new(){
	bb_reflection_FieldInfo_new.call(this,"message",2,bb_reflection__stringClass);
	return this;
}
function bb_reflection_R20(){
	bb_reflection_FieldInfo.call(this);
}
bb_reflection_R20.prototype=extend_class(bb_reflection_FieldInfo);
function bb_reflection_R20_new(){
	bb_reflection_FieldInfo_new.call(this,"cause",2,bb_reflection__classes[1]);
	return this;
}
function bb_reflection_R21(){
	bb_reflection_FieldInfo.call(this);
}
bb_reflection_R21.prototype=extend_class(bb_reflection_FieldInfo);
function bb_reflection_R21_new(){
	bb_reflection_FieldInfo_new.call(this,"type",2,bb_reflection__stringClass);
	return this;
}
function bb_reflection_R22(){
	bb_reflection_FieldInfo.call(this);
}
bb_reflection_R22.prototype=extend_class(bb_reflection_FieldInfo);
function bb_reflection_R22_new(){
	bb_reflection_FieldInfo_new.call(this,"fullType",2,bb_reflection__stringClass);
	return this;
}
function bb_reflection_R23(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R23.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R23_new(){
	bb_reflection_MethodInfo_new.call(this,"Message",8,bb_reflection__stringClass,[]);
	return this;
}
function bb_reflection_R24(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R24.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R24_new(){
	bb_reflection_MethodInfo_new.call(this,"Message",8,null,[bb_reflection__stringClass]);
	return this;
}
function bb_reflection_R25(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R25.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R25_new(){
	bb_reflection_MethodInfo_new.call(this,"Cause",8,bb_reflection__classes[1],[]);
	return this;
}
function bb_reflection_R26(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R26.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R26_new(){
	bb_reflection_MethodInfo_new.call(this,"Cause",8,null,[bb_reflection__classes[1]]);
	return this;
}
function bb_reflection_R27(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R27.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R27_new(){
	bb_reflection_MethodInfo_new.call(this,"Type",8,bb_reflection__stringClass,[]);
	return this;
}
function bb_reflection_R28(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R28.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R28_new(){
	bb_reflection_MethodInfo_new.call(this,"FullType",8,bb_reflection__stringClass,[]);
	return this;
}
function bb_reflection_R30(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R30.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R30_new(){
	bb_reflection_MethodInfo_new.call(this,"ToString",0,bb_reflection__stringClass,[bb_reflection__boolClass]);
	return this;
}
function bb_reflection_R29(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R29.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R29_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[2],[bb_reflection__stringClass,bb_reflection__classes[1]]);
	return this;
}
function bb_reflection_R32(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R32.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R32_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[3],[bb_reflection__stringClass,bb_reflection__classes[1]]);
	return this;
}
function bb_reflection_R34(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R34.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R34_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[4],[bb_reflection__stringClass,bb_reflection__classes[1]]);
	return this;
}
function bb_reflection_R36(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R36.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R36_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[5],[bb_reflection__stringClass,bb_reflection__classes[1]]);
	return this;
}
function bb_reflection_R38(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R38.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R38_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[6],[bb_reflection__stringClass,bb_reflection__classes[1]]);
	return this;
}
function bb_reflection_R40(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R40.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R40_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[7],[bb_reflection__stringClass,bb_reflection__classes[1]]);
	return this;
}
function bb_reflection_R42(){
	bb_reflection_FieldInfo.call(this);
}
bb_reflection_R42.prototype=extend_class(bb_reflection_FieldInfo);
function bb_reflection_R42_new(){
	bb_reflection_FieldInfo_new.call(this,"value",0,bb_reflection__boolClass);
	return this;
}
function bb_reflection_R44(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R44.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R44_new(){
	bb_reflection_MethodInfo_new.call(this,"ToBool",0,bb_reflection__boolClass,[]);
	return this;
}
function bb_reflection_R45(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R45.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R45_new(){
	bb_reflection_MethodInfo_new.call(this,"Equals",0,bb_reflection__boolClass,[bb_reflection__classes[8]]);
	return this;
}
function bb_reflection_R43(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R43.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R43_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[8],[bb_reflection__boolClass]);
	return this;
}
function bb_reflection_R46(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R46.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R46_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[8],[]);
	return this;
}
function bb_reflection_R48(){
	bb_reflection_FieldInfo.call(this);
}
bb_reflection_R48.prototype=extend_class(bb_reflection_FieldInfo);
function bb_reflection_R48_new(){
	bb_reflection_FieldInfo_new.call(this,"value",0,bb_reflection__intClass);
	return this;
}
function bb_reflection_R51(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R51.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R51_new(){
	bb_reflection_MethodInfo_new.call(this,"ToInt",0,bb_reflection__intClass,[]);
	return this;
}
function bb_reflection_R52(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R52.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R52_new(){
	bb_reflection_MethodInfo_new.call(this,"ToFloat",0,bb_reflection__floatClass,[]);
	return this;
}
function bb_reflection_R53(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R53.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R53_new(){
	bb_reflection_MethodInfo_new.call(this,"ToString",0,bb_reflection__stringClass,[]);
	return this;
}
function bb_reflection_R54(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R54.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R54_new(){
	bb_reflection_MethodInfo_new.call(this,"Equals",0,bb_reflection__boolClass,[bb_reflection__classes[9]]);
	return this;
}
function bb_reflection_R55(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R55.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R55_new(){
	bb_reflection_MethodInfo_new.call(this,"Compare",0,bb_reflection__intClass,[bb_reflection__classes[9]]);
	return this;
}
function bb_reflection_R49(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R49.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R49_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[9],[bb_reflection__intClass]);
	return this;
}
function bb_reflection_R50(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R50.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R50_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[9],[bb_reflection__floatClass]);
	return this;
}
function bb_reflection_R56(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R56.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R56_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[9],[]);
	return this;
}
function bb_reflection_R58(){
	bb_reflection_FieldInfo.call(this);
}
bb_reflection_R58.prototype=extend_class(bb_reflection_FieldInfo);
function bb_reflection_R58_new(){
	bb_reflection_FieldInfo_new.call(this,"value",0,bb_reflection__floatClass);
	return this;
}
function bb_reflection_R61(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R61.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R61_new(){
	bb_reflection_MethodInfo_new.call(this,"ToInt",0,bb_reflection__intClass,[]);
	return this;
}
function bb_reflection_R62(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R62.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R62_new(){
	bb_reflection_MethodInfo_new.call(this,"ToFloat",0,bb_reflection__floatClass,[]);
	return this;
}
function bb_reflection_R63(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R63.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R63_new(){
	bb_reflection_MethodInfo_new.call(this,"ToString",0,bb_reflection__stringClass,[]);
	return this;
}
function bb_reflection_R64(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R64.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R64_new(){
	bb_reflection_MethodInfo_new.call(this,"Equals",0,bb_reflection__boolClass,[bb_reflection__classes[10]]);
	return this;
}
function bb_reflection_R65(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R65.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R65_new(){
	bb_reflection_MethodInfo_new.call(this,"Compare",0,bb_reflection__intClass,[bb_reflection__classes[10]]);
	return this;
}
function bb_reflection_R59(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R59.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R59_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[10],[bb_reflection__intClass]);
	return this;
}
function bb_reflection_R60(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R60.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R60_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[10],[bb_reflection__floatClass]);
	return this;
}
function bb_reflection_R66(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R66.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R66_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[10],[]);
	return this;
}
function bb_reflection_R68(){
	bb_reflection_FieldInfo.call(this);
}
bb_reflection_R68.prototype=extend_class(bb_reflection_FieldInfo);
function bb_reflection_R68_new(){
	bb_reflection_FieldInfo_new.call(this,"value",0,bb_reflection__stringClass);
	return this;
}
function bb_reflection_R72(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R72.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R72_new(){
	bb_reflection_MethodInfo_new.call(this,"ToString",0,bb_reflection__stringClass,[]);
	return this;
}
function bb_reflection_R73(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R73.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R73_new(){
	bb_reflection_MethodInfo_new.call(this,"Equals",0,bb_reflection__boolClass,[bb_reflection__classes[11]]);
	return this;
}
function bb_reflection_R74(){
	bb_reflection_MethodInfo.call(this);
}
bb_reflection_R74.prototype=extend_class(bb_reflection_MethodInfo);
function bb_reflection_R74_new(){
	bb_reflection_MethodInfo_new.call(this,"Compare",0,bb_reflection__intClass,[bb_reflection__classes[11]]);
	return this;
}
function bb_reflection_R69(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R69.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R69_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[11],[bb_reflection__intClass]);
	return this;
}
function bb_reflection_R70(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R70.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R70_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[11],[bb_reflection__floatClass]);
	return this;
}
function bb_reflection_R71(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R71.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R71_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[11],[bb_reflection__stringClass]);
	return this;
}
function bb_reflection_R75(){
	bb_reflection_FunctionInfo.call(this);
}
bb_reflection_R75.prototype=extend_class(bb_reflection_FunctionInfo);
function bb_reflection_R75_new(){
	bb_reflection_FunctionInfo_new.call(this,"new",0,bb_reflection__classes[11],[]);
	return this;
}
function bb_reflection_UnknownClass(){
	bb_reflection_ClassInfo.call(this);
}
bb_reflection_UnknownClass.prototype=extend_class(bb_reflection_ClassInfo);
function bb_reflection_UnknownClass_new(){
	bb_reflection_ClassInfo_new.call(this,"?",0,null,[]);
	return this;
}
var bb_reflection__unknownClass;
function bb_graphics_Image(){
	Object.call(this);
	this.f_surface=null;
	this.f_width=0;
	this.f_height=0;
	this.f_frames=[];
	this.f_flags=0;
	this.f_tx=.0;
	this.f_ty=.0;
	this.f_source=null;
}
var bb_graphics_Image_DefaultFlags;
function bb_graphics_Image_new(){
	return this;
}
bb_graphics_Image.prototype.m_SetHandle=function(t_tx,t_ty){
	this.f_tx=t_tx;
	this.f_ty=t_ty;
	this.f_flags=this.f_flags&-2;
	return 0;
}
bb_graphics_Image.prototype.m_ApplyFlags=function(t_iflags){
	this.f_flags=t_iflags;
	if((this.f_flags&2)!=0){
		var t_=this.f_frames;
		var t_2=0;
		while(t_2<t_.length){
			var t_f=t_[t_2];
			t_2=t_2+1;
			t_f.f_x+=1;
		}
		this.f_width-=2;
	}
	if((this.f_flags&4)!=0){
		var t_3=this.f_frames;
		var t_4=0;
		while(t_4<t_3.length){
			var t_f2=t_3[t_4];
			t_4=t_4+1;
			t_f2.f_y+=1;
		}
		this.f_height-=2;
	}
	if((this.f_flags&1)!=0){
		this.m_SetHandle((this.f_width)/2.0,(this.f_height)/2.0);
	}
	if(this.f_frames.length==1 && this.f_frames[0].f_x==0 && this.f_frames[0].f_y==0 && this.f_width==this.f_surface.Width() && this.f_height==this.f_surface.Height()){
		this.f_flags|=65536;
	}
	return 0;
}
bb_graphics_Image.prototype.m_Init2=function(t_surf,t_nframes,t_iflags){
	this.f_surface=t_surf;
	this.f_width=((this.f_surface.Width()/t_nframes)|0);
	this.f_height=this.f_surface.Height();
	this.f_frames=new_object_array(t_nframes);
	for(var t_i=0;t_i<t_nframes;t_i=t_i+1){
		this.f_frames[t_i]=bb_graphics_Frame_new.call(new bb_graphics_Frame,t_i*this.f_width,0);
	}
	this.m_ApplyFlags(t_iflags);
	return this;
}
bb_graphics_Image.prototype.m_Grab=function(t_x,t_y,t_iwidth,t_iheight,t_nframes,t_iflags,t_source){
	this.f_source=t_source;
	this.f_surface=t_source.f_surface;
	this.f_width=t_iwidth;
	this.f_height=t_iheight;
	this.f_frames=new_object_array(t_nframes);
	var t_ix=t_x;
	var t_iy=t_y;
	for(var t_i=0;t_i<t_nframes;t_i=t_i+1){
		if(t_ix+this.f_width>t_source.f_width){
			t_ix=0;
			t_iy+=this.f_height;
		}
		if(t_ix+this.f_width>t_source.f_width || t_iy+this.f_height>t_source.f_height){
			error("Image frame outside surface");
		}
		this.f_frames[t_i]=bb_graphics_Frame_new.call(new bb_graphics_Frame,t_ix+t_source.f_frames[0].f_x,t_iy+t_source.f_frames[0].f_y);
		t_ix+=this.f_width;
	}
	this.m_ApplyFlags(t_iflags);
	return this;
}
bb_graphics_Image.prototype.m_GrabImage=function(t_x,t_y,t_width,t_height,t_frames,t_flags){
	if(this.f_frames.length!=1){
		return null;
	}
	return (bb_graphics_Image_new.call(new bb_graphics_Image)).m_Grab(t_x,t_y,t_width,t_height,t_frames,t_flags,this);
}
bb_graphics_Image.prototype.m_HandleX=function(){
	return this.f_tx;
}
bb_graphics_Image.prototype.m_HandleY=function(){
	return this.f_ty;
}
bb_graphics_Image.prototype.m_Width=function(){
	return this.f_width;
}
bb_graphics_Image.prototype.m_Height=function(){
	return this.f_height;
}
bb_graphics_Image.prototype.m_Frames=function(){
	return this.f_frames.length;
}
function bb_graphics_GraphicsContext(){
	Object.call(this);
	this.f_defaultFont=null;
	this.f_font=null;
	this.f_firstChar=0;
	this.f_matrixSp=0;
	this.f_ix=1.0;
	this.f_iy=.0;
	this.f_jx=.0;
	this.f_jy=1.0;
	this.f_tx=.0;
	this.f_ty=.0;
	this.f_tformed=0;
	this.f_matDirty=0;
	this.f_color_r=.0;
	this.f_color_g=.0;
	this.f_color_b=.0;
	this.f_alpha=.0;
	this.f_blend=0;
	this.f_scissor_x=.0;
	this.f_scissor_y=.0;
	this.f_scissor_width=.0;
	this.f_scissor_height=.0;
	this.f_matrixStack=new_number_array(192);
}
function bb_graphics_GraphicsContext_new(){
	return this;
}
bb_graphics_GraphicsContext.prototype.m_Validate=function(){
	if((this.f_matDirty)!=0){
		bb_graphics_renderDevice.SetMatrix(bb_graphics_context.f_ix,bb_graphics_context.f_iy,bb_graphics_context.f_jx,bb_graphics_context.f_jy,bb_graphics_context.f_tx,bb_graphics_context.f_ty);
		this.f_matDirty=0;
	}
	return 0;
}
var bb_graphics_context;
function bb_data_FixDataPath(t_path){
	var t_i=t_path.indexOf(":/",0);
	if(t_i!=-1 && t_path.indexOf("/",0)==t_i+1){
		return t_path;
	}
	if(string_startswith(t_path,"./") || string_startswith(t_path,"/")){
		return t_path;
	}
	return "monkey://data/"+t_path;
}
function bb_graphics_Frame(){
	Object.call(this);
	this.f_x=0;
	this.f_y=0;
}
function bb_graphics_Frame_new(t_x,t_y){
	this.f_x=t_x;
	this.f_y=t_y;
	return this;
}
function bb_graphics_Frame_new2(){
	return this;
}
function bb_graphics_LoadImage(t_path,t_frameCount,t_flags){
	var t_surf=bb_graphics_device.LoadSurface(bb_data_FixDataPath(t_path));
	if((t_surf)!=null){
		return (bb_graphics_Image_new.call(new bb_graphics_Image)).m_Init2(t_surf,t_frameCount,t_flags);
	}
	return null;
}
function bb_graphics_LoadImage2(t_path,t_frameWidth,t_frameHeight,t_frameCount,t_flags){
	var t_atlas=bb_graphics_LoadImage(t_path,1,0);
	if((t_atlas)!=null){
		return t_atlas.m_GrabImage(0,0,t_frameWidth,t_frameHeight,t_frameCount,t_flags);
	}
	return null;
}
function bb_graphics_SetFont(t_font,t_firstChar){
	if(!((t_font)!=null)){
		if(!((bb_graphics_context.f_defaultFont)!=null)){
			bb_graphics_context.f_defaultFont=bb_graphics_LoadImage("mojo_font.png",96,2);
		}
		t_font=bb_graphics_context.f_defaultFont;
		t_firstChar=32;
	}
	bb_graphics_context.f_font=t_font;
	bb_graphics_context.f_firstChar=t_firstChar;
	return 0;
}
var bb_graphics_renderDevice;
function bb_graphics_SetMatrix(t_ix,t_iy,t_jx,t_jy,t_tx,t_ty){
	bb_graphics_context.f_ix=t_ix;
	bb_graphics_context.f_iy=t_iy;
	bb_graphics_context.f_jx=t_jx;
	bb_graphics_context.f_jy=t_jy;
	bb_graphics_context.f_tx=t_tx;
	bb_graphics_context.f_ty=t_ty;
	bb_graphics_context.f_tformed=((t_ix!=1.0 || t_iy!=0.0 || t_jx!=0.0 || t_jy!=1.0 || t_tx!=0.0 || t_ty!=0.0)?1:0);
	bb_graphics_context.f_matDirty=1;
	return 0;
}
function bb_graphics_SetMatrix2(t_m){
	bb_graphics_SetMatrix(t_m[0],t_m[1],t_m[2],t_m[3],t_m[4],t_m[5]);
	return 0;
}
function bb_graphics_SetColor(t_r,t_g,t_b){
	bb_graphics_context.f_color_r=t_r;
	bb_graphics_context.f_color_g=t_g;
	bb_graphics_context.f_color_b=t_b;
	bb_graphics_renderDevice.SetColor(t_r,t_g,t_b);
	return 0;
}
function bb_graphics_SetAlpha(t_alpha){
	bb_graphics_context.f_alpha=t_alpha;
	bb_graphics_renderDevice.SetAlpha(t_alpha);
	return 0;
}
function bb_graphics_SetBlend(t_blend){
	bb_graphics_context.f_blend=t_blend;
	bb_graphics_renderDevice.SetBlend(t_blend);
	return 0;
}
function bb_graphics_DeviceWidth(){
	return bb_graphics_device.Width();
}
function bb_graphics_DeviceHeight(){
	return bb_graphics_device.Height();
}
function bb_graphics_SetScissor(t_x,t_y,t_width,t_height){
	bb_graphics_context.f_scissor_x=t_x;
	bb_graphics_context.f_scissor_y=t_y;
	bb_graphics_context.f_scissor_width=t_width;
	bb_graphics_context.f_scissor_height=t_height;
	bb_graphics_renderDevice.SetScissor(((t_x)|0),((t_y)|0),((t_width)|0),((t_height)|0));
	return 0;
}
function bb_graphics_BeginRender(){
	if(!((bb_graphics_device.Mode())!=0)){
		return 0;
	}
	bb_graphics_renderDevice=bb_graphics_device;
	bb_graphics_context.f_matrixSp=0;
	bb_graphics_SetMatrix(1.0,0.0,0.0,1.0,0.0,0.0);
	bb_graphics_SetColor(255.0,255.0,255.0);
	bb_graphics_SetAlpha(1.0);
	bb_graphics_SetBlend(0);
	bb_graphics_SetScissor(0.0,0.0,(bb_graphics_DeviceWidth()),(bb_graphics_DeviceHeight()));
	return 0;
}
function bb_graphics_EndRender(){
	bb_graphics_renderDevice=null;
	return 0;
}
var bb_framework_DEVICE_WIDTH;
var bb_framework_DEVICE_HEIGHT;
var bb_framework_SCREEN_WIDTH;
var bb_framework_SCREEN_HEIGHT;
var bb_framework_SCREEN_WIDTH2;
var bb_framework_SCREEN_HEIGHT2;
var bb_framework_SCREENX_RATIO;
var bb_framework_SCREENY_RATIO;
function bb_input_MouseX(){
	return bb_input_device.MouseX();
}
function bb_input_MouseY(){
	return bb_input_device.MouseY();
}
var bb_random_Seed;
function bb_framework_DeltaTimer(){
	Object.call(this);
	this.f_targetfps=60.0;
	this.f_lastticks=.0;
	this.f_delta=.0;
	this.f_frametime=.0;
	this.f_currentticks=.0;
}
function bb_framework_DeltaTimer_new(t_fps){
	this.f_targetfps=t_fps;
	this.f_lastticks=(bb_app_Millisecs());
	return this;
}
function bb_framework_DeltaTimer_new2(){
	return this;
}
bb_framework_DeltaTimer.prototype.m_UpdateDelta=function(){
	this.f_currentticks=(bb_app_Millisecs());
	this.f_frametime=this.f_currentticks-this.f_lastticks;
	this.f_delta=this.f_frametime/(1000.0/this.f_targetfps);
	this.f_lastticks=this.f_currentticks;
}
function bb_app_Millisecs(){
	return bb_app_device.MilliSecs();
}
var bb_framework_dt;
function bb_app_SetUpdateRate(t_hertz){
	return bb_app_device.SetUpdateRate(t_hertz);
}
function bb_framework_Sprite(){
	Object.call(this);
	this.f_image=null;
	this.f_x=.0;
	this.f_y=.0;
	this.f_alpha=1.0;
	this.f_hitBox=null;
	this.f_visible=true;
}
bb_framework_Sprite.prototype.m_SetHitBox=function(t_hitX,t_hitY,t_hitWidth,t_hitHeight){
	this.f_hitBox=bb_framework_HitBox_new.call(new bb_framework_HitBox,(t_hitX),(t_hitY),(t_hitWidth),(t_hitHeight));
}
function bb_framework_Sprite_new(t_img,t_x,t_y){
	this.f_image=t_img;
	this.f_x=t_x;
	this.f_y=t_y;
	this.f_alpha=1.0;
	this.m_SetHitBox(((-t_img.f_image.m_HandleX())|0),((-t_img.f_image.m_HandleY())|0),t_img.f_w,t_img.f_h);
	this.f_visible=true;
	return this;
}
function bb_framework_Sprite_new2(){
	return this;
}
function bb_framework_Particle(){
	bb_framework_Sprite.call(this);
}
bb_framework_Particle.prototype=extend_class(bb_framework_Sprite);
var bb_framework_Particle_MAX_PARTICLES;
function bb_framework_Particle_new(){
	bb_framework_Sprite_new2.call(this);
	return this;
}
var bb_framework_Particle_particles;
function bb_framework_Particle_Cache(){
	for(var t_i=0;t_i<=bb_framework_Particle_MAX_PARTICLES-1;t_i=t_i+1){
		bb_framework_Particle_particles[t_i]=bb_framework_Particle_new.call(new bb_framework_Particle);
	}
}
function bb_framework_HitBox(){
	Object.call(this);
	this.f_x=.0;
	this.f_y=.0;
	this.f_w=.0;
	this.f_h=.0;
}
function bb_framework_HitBox_new(t_x,t_y,t_w,t_h){
	this.f_x=t_x;
	this.f_y=t_y;
	this.f_w=t_w;
	this.f_h=t_h;
	return this;
}
function bb_framework_HitBox_new2(){
	return this;
}
function bb_framework_FPSCounter(){
	Object.call(this);
}
var bb_framework_FPSCounter_startTime;
var bb_framework_FPSCounter_fpsCount;
var bb_framework_FPSCounter_totalFPS;
function bb_framework_FPSCounter_Update(){
	if(bb_app_Millisecs()-bb_framework_FPSCounter_startTime>=1000){
		bb_framework_FPSCounter_totalFPS=bb_framework_FPSCounter_fpsCount;
		bb_framework_FPSCounter_fpsCount=0;
		bb_framework_FPSCounter_startTime=bb_app_Millisecs();
	}else{
		bb_framework_FPSCounter_fpsCount+=1;
	}
}
function bb_framework_FPSCounter_Draw(t_x,t_y,t_ax,t_ay){
	bb_graphics_DrawText("FPS: "+String(bb_framework_FPSCounter_totalFPS),(t_x),(t_y),t_ax,t_ay);
}
function bb_graphics_PushMatrix(){
	var t_sp=bb_graphics_context.f_matrixSp;
	bb_graphics_context.f_matrixStack[t_sp+0]=bb_graphics_context.f_ix;
	bb_graphics_context.f_matrixStack[t_sp+1]=bb_graphics_context.f_iy;
	bb_graphics_context.f_matrixStack[t_sp+2]=bb_graphics_context.f_jx;
	bb_graphics_context.f_matrixStack[t_sp+3]=bb_graphics_context.f_jy;
	bb_graphics_context.f_matrixStack[t_sp+4]=bb_graphics_context.f_tx;
	bb_graphics_context.f_matrixStack[t_sp+5]=bb_graphics_context.f_ty;
	bb_graphics_context.f_matrixSp=t_sp+6;
	return 0;
}
function bb_math_Max(t_x,t_y){
	if(t_x>t_y){
		return t_x;
	}
	return t_y;
}
function bb_math_Max2(t_x,t_y){
	if(t_x>t_y){
		return t_x;
	}
	return t_y;
}
function bb_math_Min(t_x,t_y){
	if(t_x<t_y){
		return t_x;
	}
	return t_y;
}
function bb_math_Min2(t_x,t_y){
	if(t_x<t_y){
		return t_x;
	}
	return t_y;
}
function bb_graphics_Cls(t_r,t_g,t_b){
	bb_graphics_renderDevice.Cls(t_r,t_g,t_b);
	return 0;
}
function bb_graphics_Transform(t_ix,t_iy,t_jx,t_jy,t_tx,t_ty){
	var t_ix2=t_ix*bb_graphics_context.f_ix+t_iy*bb_graphics_context.f_jx;
	var t_iy2=t_ix*bb_graphics_context.f_iy+t_iy*bb_graphics_context.f_jy;
	var t_jx2=t_jx*bb_graphics_context.f_ix+t_jy*bb_graphics_context.f_jx;
	var t_jy2=t_jx*bb_graphics_context.f_iy+t_jy*bb_graphics_context.f_jy;
	var t_tx2=t_tx*bb_graphics_context.f_ix+t_ty*bb_graphics_context.f_jx+bb_graphics_context.f_tx;
	var t_ty2=t_tx*bb_graphics_context.f_iy+t_ty*bb_graphics_context.f_jy+bb_graphics_context.f_ty;
	bb_graphics_SetMatrix(t_ix2,t_iy2,t_jx2,t_jy2,t_tx2,t_ty2);
	return 0;
}
function bb_graphics_Transform2(t_m){
	bb_graphics_Transform(t_m[0],t_m[1],t_m[2],t_m[3],t_m[4],t_m[5]);
	return 0;
}
function bb_graphics_Scale(t_x,t_y){
	bb_graphics_Transform(t_x,0.0,0.0,t_y,0.0,0.0);
	return 0;
}
function bb_graphics_Translate(t_x,t_y){
	bb_graphics_Transform(1.0,0.0,0.0,1.0,t_x,t_y);
	return 0;
}
function bb_diddydata_DiddyDataLayer(){
	Object.call(this);
	this.f_index=0;
	this.f_objects=bb_diddydata_DiddyDataObjects_new.call(new bb_diddydata_DiddyDataObjects);
	this.implments={bb_collections_IComparable:1};
}
bb_diddydata_DiddyDataLayer.prototype.m_Render2=function(t_xoffset,t_yoffset){
	var t_=this.f_objects.m_ObjectEnumerator();
	while(t_.m_HasNext()){
		var t_obj=t_.m_NextObject();
		if(t_obj.f_visible){
			t_obj.m_Render2(t_xoffset,t_yoffset);
		}
	}
}
function bb_collections_ICollection(){
	Object.call(this);
}
bb_collections_ICollection.prototype.m_Enumerator=function(){
}
bb_collections_ICollection.prototype.m_ObjectEnumerator=function(){
	return this.m_Enumerator();
}
bb_collections_ICollection.prototype.m_Size=function(){
}
function bb_collections_IList(){
	bb_collections_ICollection.call(this);
	this.f_modCount=0;
}
bb_collections_IList.prototype=extend_class(bb_collections_ICollection);
bb_collections_IList.prototype.m_Enumerator=function(){
	return (bb_collections_ListEnumerator_new.call(new bb_collections_ListEnumerator,this));
}
bb_collections_IList.prototype.m_Get2=function(t_index){
}
bb_collections_IList.prototype.m_RangeCheck=function(t_index){
	var t_size=this.m_Size();
	if(t_index<0 || t_index>=t_size){
		throw bb_exception_IndexOutOfBoundsException_new.call(new bb_exception_IndexOutOfBoundsException,"IList.RangeCheck: Index out of bounds: "+String(t_index)+" is not 0<=index<"+String(t_size),null);
	}
}
function bb_collections_ArrayList(){
	bb_collections_IList.call(this);
	this.f_size=0;
	this.f_elements=[];
}
bb_collections_ArrayList.prototype=extend_class(bb_collections_IList);
bb_collections_ArrayList.prototype.m_Enumerator=function(){
	return (bb_collections_ArrayListEnumerator_new.call(new bb_collections_ArrayListEnumerator,this));
}
bb_collections_ArrayList.prototype.m_Size=function(){
	return this.f_size;
}
bb_collections_ArrayList.prototype.m_RangeCheck=function(t_index){
	if(t_index<0 || t_index>=this.f_size){
		throw bb_exception_IndexOutOfBoundsException_new.call(new bb_exception_IndexOutOfBoundsException,"ArrayList.RangeCheck: Index out of bounds: "+String(t_index)+" is not 0<=index<"+String(this.f_size),null);
	}
}
bb_collections_ArrayList.prototype.m_Get2=function(t_index){
	this.m_RangeCheck(t_index);
	return object_downcast((this.f_elements[t_index]),bb_diddydata_DiddyDataLayer);
}
function bb_diddydata_DiddyDataLayers(){
	bb_collections_ArrayList.call(this);
}
bb_diddydata_DiddyDataLayers.prototype=extend_class(bb_collections_ArrayList);
function bb_collections_IEnumerator(){
	Object.call(this);
}
bb_collections_IEnumerator.prototype.m_HasNext=function(){
}
bb_collections_IEnumerator.prototype.m_NextObject=function(){
}
function bb_collections_IEnumerator_new(){
	return this;
}
function bb_diddydata_DiddyDataObject(){
	Object.call(this);
	this.f_visible=true;
	this.f_imageName="";
	this.f_alpha=1.0;
	this.f_image=null;
	this.f_red=255;
	this.f_green=255;
	this.f_blue=255;
	this.f_x=.0;
	this.f_y=.0;
	this.f_rotation=.0;
	this.f_scaleX=.0;
	this.f_scaleY=.0;
}
bb_diddydata_DiddyDataObject.prototype.m_Render2=function(t_xoffset,t_yoffset){
	if(((this.f_imageName).length!=0) && this.f_visible && this.f_alpha>0.0){
		if(!((this.f_image)!=null)){
			this.f_image=bb_framework_game.f_images.m_Find(this.f_imageName);
		}
		if((this.f_image)!=null){
			bb_graphics_SetColor((this.f_red),(this.f_green),(this.f_blue));
			bb_graphics_SetAlpha(this.f_alpha);
			this.f_image.m_Draw(this.f_x+t_xoffset,this.f_y+t_yoffset,this.f_rotation,this.f_scaleX,this.f_scaleY,0);
		}
	}
}
function bb_collections_ICollection2(){
	Object.call(this);
}
function bb_collections_ICollection2_new(){
	return this;
}
bb_collections_ICollection2.prototype.m_ToArray=function(){
}
bb_collections_ICollection2.prototype.m_Enumerator=function(){
}
bb_collections_ICollection2.prototype.m_ObjectEnumerator=function(){
	return this.m_Enumerator();
}
bb_collections_ICollection2.prototype.m_Size=function(){
}
function bb_collections_IList2(){
	bb_collections_ICollection2.call(this);
	this.f_modCount=0;
}
bb_collections_IList2.prototype=extend_class(bb_collections_ICollection2);
function bb_collections_IList2_new(){
	bb_collections_ICollection2_new.call(this);
	return this;
}
bb_collections_IList2.prototype.m_Enumerator=function(){
	return (bb_collections_ListEnumerator2_new.call(new bb_collections_ListEnumerator2,this));
}
bb_collections_IList2.prototype.m_Get2=function(t_index){
}
bb_collections_IList2.prototype.m_RangeCheck=function(t_index){
	var t_size=this.m_Size();
	if(t_index<0 || t_index>=t_size){
		throw bb_exception_IndexOutOfBoundsException_new.call(new bb_exception_IndexOutOfBoundsException,"IList.RangeCheck: Index out of bounds: "+String(t_index)+" is not 0<=index<"+String(t_size),null);
	}
}
function bb_collections_ArrayList2(){
	bb_collections_IList2.call(this);
	this.f_elements=[];
	this.f_size=0;
}
bb_collections_ArrayList2.prototype=extend_class(bb_collections_IList2);
function bb_collections_ArrayList2_new(){
	bb_collections_IList2_new.call(this);
	this.f_elements=new_object_array(10);
	return this;
}
function bb_collections_ArrayList2_new2(t_initialCapacity){
	bb_collections_IList2_new.call(this);
	if(t_initialCapacity<0){
		throw bb_exception_IllegalArgumentException_new.call(new bb_exception_IllegalArgumentException,"ArrayList.New: Capacity must be >= 0",null);
	}
	this.f_elements=new_object_array(t_initialCapacity);
	return this;
}
function bb_collections_ArrayList2_new3(t_c){
	bb_collections_IList2_new.call(this);
	if(!((t_c)!=null)){
		throw bb_exception_IllegalArgumentException_new.call(new bb_exception_IllegalArgumentException,"ArrayList.New: Source collection must not be null",null);
	}
	this.f_elements=t_c.m_ToArray();
	this.f_size=this.f_elements.length;
	return this;
}
bb_collections_ArrayList2.prototype.m_Enumerator=function(){
	return (bb_collections_ArrayListEnumerator2_new.call(new bb_collections_ArrayListEnumerator2,this));
}
bb_collections_ArrayList2.prototype.m_ToArray=function(){
	var t_arr=new_object_array(this.f_size);
	for(var t_i=0;t_i<this.f_size;t_i=t_i+1){
		t_arr[t_i]=this.f_elements[t_i];
	}
	return t_arr;
}
bb_collections_ArrayList2.prototype.m_Size=function(){
	return this.f_size;
}
bb_collections_ArrayList2.prototype.m_RangeCheck=function(t_index){
	if(t_index<0 || t_index>=this.f_size){
		throw bb_exception_IndexOutOfBoundsException_new.call(new bb_exception_IndexOutOfBoundsException,"ArrayList.RangeCheck: Index out of bounds: "+String(t_index)+" is not 0<=index<"+String(this.f_size),null);
	}
}
bb_collections_ArrayList2.prototype.m_Get2=function(t_index){
	this.m_RangeCheck(t_index);
	return object_downcast((this.f_elements[t_index]),bb_diddydata_DiddyDataObject);
}
function bb_diddydata_DiddyDataObjects(){
	bb_collections_ArrayList2.call(this);
}
bb_diddydata_DiddyDataObjects.prototype=extend_class(bb_collections_ArrayList2);
function bb_diddydata_DiddyDataObjects_new(){
	bb_collections_ArrayList2_new.call(this);
	return this;
}
function bb_collections_IEnumerator2(){
	Object.call(this);
}
bb_collections_IEnumerator2.prototype.m_HasNext=function(){
}
bb_collections_IEnumerator2.prototype.m_NextObject=function(){
}
function bb_collections_IEnumerator2_new(){
	return this;
}
function bb_map_MapKeys(){
	Object.call(this);
	this.f_map=null;
}
function bb_map_MapKeys_new(t_map){
	this.f_map=t_map;
	return this;
}
function bb_map_MapKeys_new2(){
	return this;
}
bb_map_MapKeys.prototype.m_ObjectEnumerator=function(){
	return bb_map_KeyEnumerator_new.call(new bb_map_KeyEnumerator,this.f_map.m_FirstNode());
}
function bb_map_KeyEnumerator(){
	Object.call(this);
	this.f_node=null;
}
function bb_map_KeyEnumerator_new(t_node){
	this.f_node=t_node;
	return this;
}
function bb_map_KeyEnumerator_new2(){
	return this;
}
bb_map_KeyEnumerator.prototype.m_HasNext=function(){
	return this.f_node!=null;
}
bb_map_KeyEnumerator.prototype.m_NextObject=function(){
	var t_t=this.f_node;
	this.f_node=this.f_node.m_NextNode();
	return t_t.f_key;
}
function bb_map_Node2(){
	Object.call(this);
	this.f_left=null;
	this.f_right=null;
	this.f_parent=null;
	this.f_key="";
	this.f_value=null;
}
bb_map_Node2.prototype.m_NextNode=function(){
	var t_node=null;
	if((this.f_right)!=null){
		t_node=this.f_right;
		while((t_node.f_left)!=null){
			t_node=t_node.f_left;
		}
		return t_node;
	}
	t_node=this;
	var t_parent=this.f_parent;
	while(((t_parent)!=null) && t_node==t_parent.f_right){
		t_node=t_parent;
		t_parent=t_parent.f_parent;
	}
	return t_parent;
}
function bb_assert_AssertError(t_msg){
	throw bb_exception_AssertException_new.call(new bb_exception_AssertException,t_msg,null);
}
function bb_assert_AssertNotNull(t_val,t_msg){
	if(t_val==null){
		bb_assert_AssertError(t_msg);
	}
}
function bb_graphics_PopMatrix(){
	var t_sp=bb_graphics_context.f_matrixSp-6;
	bb_graphics_SetMatrix(bb_graphics_context.f_matrixStack[t_sp+0],bb_graphics_context.f_matrixStack[t_sp+1],bb_graphics_context.f_matrixStack[t_sp+2],bb_graphics_context.f_matrixStack[t_sp+3],bb_graphics_context.f_matrixStack[t_sp+4],bb_graphics_context.f_matrixStack[t_sp+5]);
	bb_graphics_context.f_matrixSp=t_sp;
	return 0;
}
function bb_graphics_DrawImage(t_image,t_x,t_y,t_frame){
	var t_f=t_image.f_frames[t_frame];
	if((bb_graphics_context.f_tformed)!=0){
		bb_graphics_PushMatrix();
		bb_graphics_Translate(t_x-t_image.f_tx,t_y-t_image.f_ty);
		bb_graphics_context.m_Validate();
		if((t_image.f_flags&65536)!=0){
			bb_graphics_renderDevice.DrawSurface(t_image.f_surface,0.0,0.0);
		}else{
			bb_graphics_renderDevice.DrawSurface2(t_image.f_surface,0.0,0.0,t_f.f_x,t_f.f_y,t_image.f_width,t_image.f_height);
		}
		bb_graphics_PopMatrix();
	}else{
		bb_graphics_context.m_Validate();
		if((t_image.f_flags&65536)!=0){
			bb_graphics_renderDevice.DrawSurface(t_image.f_surface,t_x-t_image.f_tx,t_y-t_image.f_ty);
		}else{
			bb_graphics_renderDevice.DrawSurface2(t_image.f_surface,t_x-t_image.f_tx,t_y-t_image.f_ty,t_f.f_x,t_f.f_y,t_image.f_width,t_image.f_height);
		}
	}
	return 0;
}
function bb_graphics_Rotate(t_angle){
	bb_graphics_Transform(Math.cos((t_angle)*D2R),-Math.sin((t_angle)*D2R),Math.sin((t_angle)*D2R),Math.cos((t_angle)*D2R),0.0,0.0);
	return 0;
}
function bb_graphics_DrawImage2(t_image,t_x,t_y,t_rotation,t_scaleX,t_scaleY,t_frame){
	var t_f=t_image.f_frames[t_frame];
	bb_graphics_PushMatrix();
	bb_graphics_Translate(t_x,t_y);
	bb_graphics_Rotate(t_rotation);
	bb_graphics_Scale(t_scaleX,t_scaleY);
	bb_graphics_Translate(-t_image.f_tx,-t_image.f_ty);
	bb_graphics_context.m_Validate();
	if((t_image.f_flags&65536)!=0){
		bb_graphics_renderDevice.DrawSurface(t_image.f_surface,0.0,0.0);
	}else{
		bb_graphics_renderDevice.DrawSurface2(t_image.f_surface,0.0,0.0,t_f.f_x,t_f.f_y,t_image.f_width,t_image.f_height);
	}
	bb_graphics_PopMatrix();
	return 0;
}
function bb_graphics_DrawRect(t_x,t_y,t_w,t_h){
	bb_graphics_context.m_Validate();
	bb_graphics_renderDevice.DrawRect(t_x,t_y,t_w,t_h);
	return 0;
}
function bb_graphics_DrawText(t_text,t_x,t_y,t_xalign,t_yalign){
	if(!((bb_graphics_context.f_font)!=null)){
		return 0;
	}
	var t_w=bb_graphics_context.f_font.m_Width();
	var t_h=bb_graphics_context.f_font.m_Height();
	t_x-=Math.floor((t_w*t_text.length)*t_xalign);
	t_y-=Math.floor((t_h)*t_yalign);
	for(var t_i=0;t_i<t_text.length;t_i=t_i+1){
		var t_ch=t_text.charCodeAt(t_i)-bb_graphics_context.f_firstChar;
		if(t_ch>=0 && t_ch<bb_graphics_context.f_font.m_Frames()){
			bb_graphics_DrawImage(bb_graphics_context.f_font,t_x+(t_i*t_w),t_y,t_ch);
		}
	}
	return 0;
}
function bb_assert_Assert(t_val,t_msg){
	if(!t_val){
		bb_assert_AssertError(t_msg);
	}
}
function bb_functions_RSet(t_str,t_n,t_char){
	var t_rep="";
	for(var t_i=1;t_i<=t_n;t_i=t_i+1){
		t_rep=t_rep+t_char;
	}
	t_str=t_rep+t_str;
	return t_str.slice(t_str.length-t_n);
}
function bb_functions_FormatNumber(t_number,t_decimal,t_comma,t_padleft){
	bb_assert_Assert(t_decimal>-1 && t_comma>-1 && t_padleft>-1,"Negative numbers not allowed in FormatNumber()");
	var t_str=String(t_number);
	var t_dl=t_str.indexOf(".",0);
	if(t_decimal==0){
		t_decimal=-1;
	}
	t_str=t_str.slice(0,t_dl+t_decimal+1);
	if((t_comma)!=0){
		while(t_dl>t_comma){
			t_str=t_str.slice(0,t_dl-t_comma)+","+t_str.slice(t_dl-t_comma);
			t_dl-=t_comma;
		}
	}
	if((t_padleft)!=0){
		var t_paddedLength=t_padleft+t_decimal+1;
		if(t_paddedLength<t_str.length){
			t_str="Error";
		}
		t_str=bb_functions_RSet(t_str,t_paddedLength," ");
	}
	return t_str;
}
function bb_audio_MusicState(){
	return bb_audio_device.MusicState();
}
function bb_framework_SoundPlayer(){
	Object.call(this);
}
var bb_framework_SoundPlayer_channel;
function bb_input_MouseHit(t_button){
	return bb_input_device.KeyHit(1+t_button);
}
function bb_input_TouchHit(t_index){
	return bb_input_device.KeyHit(384+t_index);
}
function bb_input_TouchDown(t_index){
	return bb_input_device.KeyDown(384+t_index);
}
function bb_input_TouchX(t_index){
	return bb_input_device.TouchX(t_index);
}
function bb_input_TouchY(t_index){
	return bb_input_device.TouchY(t_index);
}
function bb_input_MouseDown(t_button){
	return bb_input_device.KeyDown(1+t_button);
}
function bb_input_KeyHit(t_key){
	return bb_input_device.KeyHit(t_key);
}
function bb_input_KeyDown(t_key){
	return bb_input_device.KeyDown(t_key);
}
function bb_audio_SetMusicVolume(t_volume){
	bb_audio_device.SetMusicVolume(t_volume);
	return 0;
}
function bb_audio_SetChannelVolume(t_channel,t_volume){
	bb_audio_device.SetVolume(t_channel,t_volume);
	return 0;
}
function bb_functions_StripExt(t_path){
	var t_i=t_path.lastIndexOf(".");
	if(t_i!=-1 && t_path.indexOf("/",t_i+1)==-1){
		return t_path.slice(0,t_i);
	}
	return t_path;
}
function bb_functions_StripDir(t_path){
	var t_i=t_path.lastIndexOf("/");
	if(t_i!=-1){
		return t_path.slice(t_i+1);
	}
	return t_path;
}
function bb_functions_StripAll(t_path){
	return bb_functions_StripDir(bb_functions_StripExt(t_path));
}
function bb_functions_LoadAnimBitmap(t_path,t_w,t_h,t_count,t_tmpImage){
	t_tmpImage=bb_graphics_LoadImage(t_path,1,bb_graphics_Image_DefaultFlags);
	bb_assert_AssertNotNull((t_tmpImage),"Error loading bitmap "+t_path);
	var t_pointer=t_tmpImage.m_GrabImage(0,0,t_w,t_h,t_count,1);
	return t_pointer;
}
function bb_functions_LoadBitmap(t_path,t_flags){
	var t_pointer=bb_graphics_LoadImage(t_path,1,t_flags);
	bb_assert_AssertNotNull((t_pointer),"Error loading bitmap "+t_path);
	return t_pointer;
}
function bb_map_MapKeys2(){
	Object.call(this);
	this.f_map=null;
}
function bb_map_MapKeys2_new(t_map){
	this.f_map=t_map;
	return this;
}
function bb_map_MapKeys2_new2(){
	return this;
}
bb_map_MapKeys2.prototype.m_ObjectEnumerator=function(){
	return bb_map_KeyEnumerator2_new.call(new bb_map_KeyEnumerator2,this.f_map.m_FirstNode());
}
function bb_map_KeyEnumerator2(){
	Object.call(this);
	this.f_node=null;
}
function bb_map_KeyEnumerator2_new(t_node){
	this.f_node=t_node;
	return this;
}
function bb_map_KeyEnumerator2_new2(){
	return this;
}
bb_map_KeyEnumerator2.prototype.m_HasNext=function(){
	return this.f_node!=null;
}
bb_map_KeyEnumerator2.prototype.m_NextObject=function(){
	var t_t=this.f_node;
	this.f_node=this.f_node.m_NextNode();
	return t_t.f_key;
}
function bb_map_Node3(){
	Object.call(this);
	this.f_left=null;
	this.f_right=null;
	this.f_parent=null;
	this.f_key="";
	this.f_value=null;
}
bb_map_Node3.prototype.m_NextNode=function(){
	var t_node=null;
	if((this.f_right)!=null){
		t_node=this.f_right;
		while((t_node.f_left)!=null){
			t_node=t_node.f_left;
		}
		return t_node;
	}
	t_node=this;
	var t_parent=this.f_parent;
	while(((t_parent)!=null) && t_node==t_parent.f_right){
		t_node=t_parent;
		t_parent=t_parent.f_parent;
	}
	return t_parent;
}
function bb_audio_Sound(){
	Object.call(this);
	this.f_sample=null;
}
function bb_audio_Sound_new(t_sample){
	this.f_sample=t_sample;
	return this;
}
function bb_audio_Sound_new2(){
	return this;
}
function bb_audio_LoadSound(t_path){
	var t_sample=bb_audio_device.LoadSample(bb_data_FixDataPath(t_path));
	if((t_sample)!=null){
		return bb_audio_Sound_new.call(new bb_audio_Sound,t_sample);
	}
	return null;
}
function bb_functions_LoadSoundSample(t_path){
	var t_pointer=bb_audio_LoadSound(t_path);
	bb_assert_AssertNotNull((t_pointer),"Error loading sound "+t_path);
	return t_pointer;
}
function bb_audio_PlayMusic(t_path,t_flags){
	return bb_audio_device.PlayMusic(bb_data_FixDataPath(t_path),t_flags);
}
function bb_functions_SetGraphics(t_w,t_h){
	diddy.setGraphics(t_w,t_h);
	bb_framework_DEVICE_WIDTH=(t_w);
	bb_framework_DEVICE_HEIGHT=(t_h);
	bb_framework_SCREEN_HEIGHT=(t_h);
	bb_framework_SCREEN_WIDTH=(t_w);
	bb_framework_SCREEN_WIDTH2=bb_framework_SCREEN_WIDTH/2.0;
	bb_framework_SCREEN_HEIGHT2=bb_framework_SCREEN_HEIGHT/2.0;
}
function bb_pong_GameScreen(){
	bb_framework_Screen.call(this);
	this.f_left=null;
	this.f_right=null;
	this.f_ball=null;
	this.f_maxScore=5;
}
bb_pong_GameScreen.prototype=extend_class(bb_framework_Screen);
function bb_pong_GameScreen_new(){
	bb_framework_Screen_new.call(this);
	return this;
}
bb_pong_GameScreen.prototype.m_Init=function(){
	this.f_left=bb_pong_Bat_new.call(new bb_pong_Bat,0);
	this.f_right=bb_pong_Bat_new.call(new bb_pong_Bat,1);
	this.f_ball=bb_pong_Ball_new.call(new bb_pong_Ball);
	return 0;
}
bb_pong_GameScreen.prototype.m_Start2=function(){
	this.m_Init();
}
bb_pong_GameScreen.prototype.m_Update2=function(){
	this.f_left.m_Input();
	this.f_right.m_AI(this.f_ball);
	if(this.f_ball.m_Collide(this.f_left)){
	}
	if(this.f_ball.m_Collide(this.f_right)){
	}
	var t_died=this.f_ball.m_Died();
	if(t_died==0){
		this.f_right.f_score=this.f_right.f_score+1;
	}else{
		if(t_died==1){
			this.f_left.f_score=this.f_left.f_score+1;
		}
	}
	if(this.f_left.f_score>this.f_maxScore || this.f_right.f_score>this.f_maxScore){
		this.m_FadeToScreen((bb_pong_gameOverScreen),bb_framework_defaultFadeTime,false,false,true);
	}
	if(t_died>=0){
		this.f_ball=bb_pong_Ball_new.call(new bb_pong_Ball);
	}
	this.f_ball.m_Update2();
}
bb_pong_GameScreen.prototype.m_Render=function(){
	bb_graphics_Cls(0.0,0.0,0.0);
	this.f_left.m_Draw2();
	this.f_right.m_Draw2();
	this.f_ball.m_Draw2();
}
var bb_pong_gameScreen;
function bb_pong_GameOverScreen(){
	bb_framework_Screen.call(this);
}
bb_pong_GameOverScreen.prototype=extend_class(bb_framework_Screen);
function bb_pong_GameOverScreen_new(){
	bb_framework_Screen_new.call(this);
	return this;
}
bb_pong_GameOverScreen.prototype.m_Start2=function(){
}
bb_pong_GameOverScreen.prototype.m_Update2=function(){
	if(((bb_input_MouseHit(0))!=0) || ((bb_input_KeyHit(32))!=0) || ((bb_input_TouchHit(0))!=0)){
		bb_pong_gameScreen.m_Init();
		this.m_FadeToScreen((bb_pong_gameScreen),bb_framework_defaultFadeTime,false,false,true);
	}
}
bb_pong_GameOverScreen.prototype.m_Render=function(){
	bb_graphics_Cls(0.0,0.0,0.0);
	bb_graphics_SetColor(255.0,255.0,255.0);
	var t_s="Game Over - ";
	if(bb_pong_gameScreen.f_left.f_score>bb_pong_gameScreen.f_right.f_score){
		t_s=t_s+"YOU WON!";
	}else{
		t_s=t_s+"I WON!";
	}
	bb_graphics_DrawText(t_s,bb_framework_SCREEN_WIDTH2-bb_graphics_TextWidth(t_s)/2.0,bb_framework_SCREEN_HEIGHT2,0.0,0.0);
	t_s="Tap screen or left mouse button to continue";
	bb_graphics_DrawText(t_s,bb_framework_SCREEN_WIDTH2-bb_graphics_TextWidth(t_s)/2.0,bb_framework_SCREEN_HEIGHT2+20.0,0.0,0.0);
}
var bb_pong_gameOverScreen;
var bb_framework_defaultFadeTime;
function bb_functions_ExitApp(){
	error("");
}
function bb_collections_ListEnumerator(){
	bb_collections_IEnumerator.call(this);
	this.f_lst=null;
	this.f_expectedModCount=0;
	this.f_index=0;
	this.f_lastIndex=0;
}
bb_collections_ListEnumerator.prototype=extend_class(bb_collections_IEnumerator);
function bb_collections_ListEnumerator_new(t_lst){
	bb_collections_IEnumerator_new.call(this);
	this.f_lst=t_lst;
	this.f_expectedModCount=t_lst.f_modCount;
	return this;
}
function bb_collections_ListEnumerator_new2(){
	bb_collections_IEnumerator_new.call(this);
	return this;
}
bb_collections_ListEnumerator.prototype.m_CheckConcurrency=function(){
	if(this.f_lst.f_modCount!=this.f_expectedModCount){
		throw bb_exception_ConcurrentModificationException_new.call(new bb_exception_ConcurrentModificationException,"ListEnumerator.CheckConcurrency: Concurrent list modification",null);
	}
}
bb_collections_ListEnumerator.prototype.m_HasNext=function(){
	this.m_CheckConcurrency();
	return this.f_index<this.f_lst.m_Size();
}
bb_collections_ListEnumerator.prototype.m_NextObject=function(){
	this.m_CheckConcurrency();
	this.f_lastIndex=this.f_index;
	this.f_index+=1;
	return this.f_lst.m_Get2(this.f_lastIndex);
}
function bb_collections_ArrayListEnumerator(){
	bb_collections_ListEnumerator.call(this);
	this.f_alst=null;
}
bb_collections_ArrayListEnumerator.prototype=extend_class(bb_collections_ListEnumerator);
function bb_collections_ArrayListEnumerator_new(t_lst){
	bb_collections_ListEnumerator_new.call(this,(t_lst));
	this.f_alst=t_lst;
	this.f_expectedModCount=this.f_alst.f_modCount;
	return this;
}
function bb_collections_ArrayListEnumerator_new2(){
	bb_collections_ListEnumerator_new2.call(this);
	return this;
}
bb_collections_ArrayListEnumerator.prototype.m_HasNext=function(){
	this.m_CheckConcurrency();
	return this.f_index<this.f_alst.f_size;
}
bb_collections_ArrayListEnumerator.prototype.m_NextObject=function(){
	this.m_CheckConcurrency();
	this.f_lastIndex=this.f_index;
	this.f_index+=1;
	return object_downcast((this.f_alst.f_elements[this.f_lastIndex]),bb_diddydata_DiddyDataLayer);
}
function bb_collections_ListEnumerator2(){
	bb_collections_IEnumerator2.call(this);
	this.f_lst=null;
	this.f_expectedModCount=0;
	this.f_index=0;
	this.f_lastIndex=0;
}
bb_collections_ListEnumerator2.prototype=extend_class(bb_collections_IEnumerator2);
function bb_collections_ListEnumerator2_new(t_lst){
	bb_collections_IEnumerator2_new.call(this);
	this.f_lst=t_lst;
	this.f_expectedModCount=t_lst.f_modCount;
	return this;
}
function bb_collections_ListEnumerator2_new2(){
	bb_collections_IEnumerator2_new.call(this);
	return this;
}
bb_collections_ListEnumerator2.prototype.m_CheckConcurrency=function(){
	if(this.f_lst.f_modCount!=this.f_expectedModCount){
		throw bb_exception_ConcurrentModificationException_new.call(new bb_exception_ConcurrentModificationException,"ListEnumerator.CheckConcurrency: Concurrent list modification",null);
	}
}
bb_collections_ListEnumerator2.prototype.m_HasNext=function(){
	this.m_CheckConcurrency();
	return this.f_index<this.f_lst.m_Size();
}
bb_collections_ListEnumerator2.prototype.m_NextObject=function(){
	this.m_CheckConcurrency();
	this.f_lastIndex=this.f_index;
	this.f_index+=1;
	return this.f_lst.m_Get2(this.f_lastIndex);
}
function bb_collections_ArrayListEnumerator2(){
	bb_collections_ListEnumerator2.call(this);
	this.f_alst=null;
}
bb_collections_ArrayListEnumerator2.prototype=extend_class(bb_collections_ListEnumerator2);
function bb_collections_ArrayListEnumerator2_new(t_lst){
	bb_collections_ListEnumerator2_new.call(this,(t_lst));
	this.f_alst=t_lst;
	this.f_expectedModCount=this.f_alst.f_modCount;
	return this;
}
function bb_collections_ArrayListEnumerator2_new2(){
	bb_collections_ListEnumerator2_new2.call(this);
	return this;
}
bb_collections_ArrayListEnumerator2.prototype.m_HasNext=function(){
	this.m_CheckConcurrency();
	return this.f_index<this.f_alst.f_size;
}
bb_collections_ArrayListEnumerator2.prototype.m_NextObject=function(){
	this.m_CheckConcurrency();
	this.f_lastIndex=this.f_index;
	this.f_index+=1;
	return object_downcast((this.f_alst.f_elements[this.f_lastIndex]),bb_diddydata_DiddyDataObject);
}
function bb_pong_Bat(){
	Object.call(this);
	this.f_size=null;
	this.f_margin=10;
	this.f_position=null;
	this.f_velocity=10;
	this.f_down=false;
	this.f_touchCoor=.0;
	this.f_score=0;
}
function bb_pong_Bat_new(t_pos){
	this.f_size=bb_vector2d_Vector2D_new.call(new bb_vector2d_Vector2D,10.0,bb_framework_SCREEN_HEIGHT/6.0);
	var t_x=this.f_margin;
	var t_y=bb_framework_SCREEN_HEIGHT2-this.f_size.f_y/2.0;
	if(t_pos==1){
		t_x=((bb_framework_SCREEN_WIDTH-(this.f_size.f_x+(this.f_margin)))|0);
	}
	this.f_position=bb_vector2d_Vector2D_new.call(new bb_vector2d_Vector2D,(t_x),t_y);
	return this;
}
bb_pong_Bat.prototype.m_OutOfBounds=function(){
	if(this.f_position.f_y<=0.0){
		this.f_position.f_y=0.0;
	}
	if(this.f_position.f_y+this.f_size.f_y>=bb_framework_SCREEN_HEIGHT){
		this.f_position.f_y=bb_framework_SCREEN_HEIGHT-this.f_size.f_y;
	}
	return 0;
}
bb_pong_Bat.prototype.m_Input=function(){
	if(bb_input_KeyDown(40)==1){
		this.f_position.f_y=this.f_position.f_y+(this.f_velocity);
	}
	if(bb_input_KeyDown(38)==1){
		this.f_position.f_y=this.f_position.f_y-(this.f_velocity);
	}
	if((bb_input_TouchDown(0))!=0){
		if(!this.f_down){
			this.f_touchCoor=this.f_position.f_y-bb_input_MouseY();
			this.f_down=true;
		}
		this.f_position.f_y=this.f_touchCoor+bb_input_MouseY();
	}else{
		this.f_down=false;
	}
	this.m_OutOfBounds();
	return 0;
}
bb_pong_Bat.prototype.m_AI=function(t_ball){
	this.f_position.f_y=this.f_position.f_y+(this.f_velocity)*Math.cos((t_ball.f_angle)*D2R);
	this.m_OutOfBounds();
	return 0;
}
bb_pong_Bat.prototype.m_Draw2=function(){
	bb_graphics_SetColor(255.0,255.0,255.0);
	bb_graphics_DrawRect(this.f_position.f_x,this.f_position.f_y,this.f_size.f_x,this.f_size.f_y);
	bb_graphics_DrawText(String(this.f_score),bb_framework_SCREEN_WIDTH2+bb_graphics_TextWidth(String(this.f_score))*((this.f_position.f_x-bb_framework_SCREEN_WIDTH2)/bb_math_Abs2(this.f_position.f_x-bb_framework_SCREEN_WIDTH2)),10.0,0.0,0.0);
	return 0;
}
function bb_vector2d_Vector2D(){
	Object.call(this);
	this.f_x=.0;
	this.f_y=.0;
}
function bb_vector2d_Vector2D_new(t_x,t_y){
	this.f_x=t_x;
	this.f_y=t_y;
	return this;
}
bb_vector2d_Vector2D.prototype.m_Add=function(t_vector2){
	this.f_x+=t_vector2.f_x;
	this.f_y+=t_vector2.f_y;
	return this;
}
function bb_pong_Ball(){
	Object.call(this);
	this.f_angle=.0;
	this.f_radius=10;
	this.f_position=null;
	this.f_velocity=10;
	this.f_direction=null;
}
bb_pong_Ball.prototype.m_CalcDirection=function(){
	this.f_direction=bb_vector2d_Vector2D_new.call(new bb_vector2d_Vector2D,(this.f_velocity)*Math.sin((this.f_angle)*D2R),(this.f_velocity)*Math.cos((this.f_angle)*D2R));
	return 0;
}
function bb_pong_Ball_new(){
	this.f_angle=bb_random_Rnd3(45.0)+45.0;
	if(bb_random_Rnd3(10.0)>5.0){
		this.f_angle=this.f_angle+180.0;
	}
	this.f_position=bb_vector2d_Vector2D_new.call(new bb_vector2d_Vector2D,bb_framework_SCREEN_WIDTH2-((this.f_radius/2)|0),bb_framework_SCREEN_HEIGHT2-((this.f_radius/2)|0));
	this.m_CalcDirection();
	return this;
}
bb_pong_Ball.prototype.m_Collide=function(t_bat){
	if((bb_functions_RectsOverlap(this.f_position.f_x-((this.f_radius/2)|0),this.f_position.f_y-((this.f_radius/2)|0),(this.f_radius),(this.f_radius),t_bat.f_position.f_x,t_bat.f_position.f_y,t_bat.f_size.f_x,t_bat.f_size.f_y))!=0){
		this.f_angle=360.0-this.f_angle;
		this.m_CalcDirection();
		this.f_position.f_x=this.f_position.f_x-(t_bat.f_margin)*((t_bat.f_position.f_x-bb_framework_SCREEN_WIDTH2)/bb_math_Abs2(t_bat.f_position.f_x-bb_framework_SCREEN_WIDTH2));
		return true;
	}
	return false;
}
bb_pong_Ball.prototype.m_Died=function(){
	if(this.f_position.f_x<0.0){
		return 0;
	}
	if(this.f_position.f_x>bb_framework_SCREEN_WIDTH){
		return 1;
	}
	return -1;
}
bb_pong_Ball.prototype.m_Update2=function(){
	this.f_position.m_Add(this.f_direction);
	if(this.f_position.f_y-((this.f_radius/2)|0)<0.0 || this.f_position.f_y+((this.f_radius/2)|0)>bb_framework_SCREEN_HEIGHT){
		this.f_angle=180.0-this.f_angle;
		this.m_CalcDirection();
	}
	return 0;
}
bb_pong_Ball.prototype.m_Draw2=function(){
	bb_graphics_SetColor(255.0,255.0,255.0);
	bb_graphics_DrawCircle(this.f_position.f_x,this.f_position.f_y,(this.f_radius));
	return 0;
}
function bb_random_Rnd(){
	bb_random_Seed=bb_random_Seed*1664525+1013904223|0;
	return (bb_random_Seed>>8&16777215)/16777216.0;
}
function bb_random_Rnd2(t_low,t_high){
	return bb_random_Rnd3(t_high-t_low)+t_low;
}
function bb_random_Rnd3(t_range){
	return bb_random_Rnd()*t_range;
}
function bb_functions_RectsOverlap(t_x0,t_y0,t_w0,t_h0,t_x2,t_y2,t_w2,t_h2){
	if(t_x0>t_x2+t_w2 || t_x0+t_w0<t_x2){
		return 0;
	}
	if(t_y0>t_y2+t_h2 || t_y0+t_h0<t_y2){
		return 0;
	}
	return 1;
}
function bb_math_Abs(t_x){
	if(t_x>=0){
		return t_x;
	}
	return -t_x;
}
function bb_math_Abs2(t_x){
	if(t_x>=0.0){
		return t_x;
	}
	return -t_x;
}
function bb_graphics_TextWidth(t_text){
	if((bb_graphics_context.f_font)!=null){
		return (t_text.length*bb_graphics_context.f_font.m_Width());
	}
	return 0;
}
function bb_graphics_DrawCircle(t_x,t_y,t_r){
	bb_graphics_context.m_Validate();
	bb_graphics_renderDevice.DrawOval(t_x-t_r,t_y-t_r,t_r*2.0,t_r*2.0);
	return 0;
}
function bbInit(){
	bb_reflection__classesMap=null;
	bb_reflection__classes=[];
	bb_reflection__getClass=null;
	bb_reflection__boolClass=null;
	bb_reflection__intClass=null;
	bb_reflection__floatClass=null;
	bb_reflection__stringClass=null;
	bb_reflection__functions=[];
	bb_reflection__init=bb_reflection___init();
	bb_graphics_device=null;
	bb_input_device=null;
	bb_audio_device=null;
	bb_app_device=null;
	bb_framework_game=null;
	bb_reflection__unknownClass=(bb_reflection_UnknownClass_new.call(new bb_reflection_UnknownClass));
	bb_graphics_context=bb_graphics_GraphicsContext_new.call(new bb_graphics_GraphicsContext);
	bb_graphics_Image_DefaultFlags=0;
	bb_graphics_renderDevice=null;
	bb_framework_DEVICE_WIDTH=.0;
	bb_framework_DEVICE_HEIGHT=.0;
	bb_framework_SCREEN_WIDTH=.0;
	bb_framework_SCREEN_HEIGHT=.0;
	bb_framework_SCREEN_WIDTH2=.0;
	bb_framework_SCREEN_HEIGHT2=.0;
	bb_framework_SCREENX_RATIO=1.0;
	bb_framework_SCREENY_RATIO=1.0;
	bb_random_Seed=1234;
	bb_framework_dt=null;
	bb_framework_Particle_MAX_PARTICLES=800;
	bb_framework_Particle_particles=new_object_array(bb_framework_Particle_MAX_PARTICLES);
	bb_framework_FPSCounter_startTime=0;
	bb_framework_FPSCounter_fpsCount=0;
	bb_framework_FPSCounter_totalFPS=0;
	bb_framework_SoundPlayer_channel=0;
	bb_framework_SoundBank_path="sounds/";
	bb_pong_gameScreen=null;
	bb_pong_gameOverScreen=null;
	bb_framework_defaultFadeTime=600.0;
}
//${TRANSCODE_END}
