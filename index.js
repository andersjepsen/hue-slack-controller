http = require('http');
var qs = require('querystring');
var c = require('./colors.js');

var slackToken = 'BjjV9927NSP2B6nr99juCfjm'; //token generated on slack
var hueIp = '10.0.0.2'; //ip to access the hue bridge
var hueUsername = '373a838a7a48f091779fa41234e22138'; //username assigned by hue bridge
var host = '127.0.0.1'; //localhost
var port = 3000; //the port you desire

console.log(convertColor('#ff0064'));

server = http.createServer( function(req, res) {
	var post = '';
	var reply = "Invalid application!";

    if (req.method == 'POST') {
		
        var body = '';
        req.on('data', function (data) {
            body += data;
			post = qs.parse(body);
        });
        req.on('end', function () {
			if(post.token == slackToken)
			{
				console.log("from: " + post.user_name);
				console.log("text: " + post.text);
				reply = validateCommand(post.text);
			}
			
	        res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(reply);
        });
    }
    else{//handle other requests
	}

});

server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);

function validateCommand(text) {
    var commands = text.split(" ");
	
	var text = '{}';
	var json = JSON.parse(text);
	var reply = 'Not a valid command!';
	
	var config = {
	  host: hueIp,
	  path: '/api/'+ hueUsername +'/lights/1/state',
	  method: 'PUT',
	};
	
	if(commands.length == 1)
	{		
		var res = action(commands[0]);
		json = res.json;
		reply = res.reply;
	}
	else if(commands.length == 2)
	{
		console.log(commands);
	}
	else if(commands.length == 3)
	{
		console.log(commands);
		var conf = generateConfig(commands);
		var res = action(commands[2]);
		json = res.json;
		reply = res.reply;
		config.path = '/api/' + hueUsername + '/'+conf.type+'/'+conf.id+'/'+conf.selector;
	}
	
	sendCommand(config,json);
	console.log(reply);
	return reply;
}

function action(cmd)
{
	var text = '{"on":true,"effect":"none","xy":[]}';
	var json = JSON.parse(text);
	
	var onoff = {on:true, off:false};
	
	var color = c.colors();
	
	if(cmd == "on" || cmd == "off")
	{
		json.on = onoff[cmd];
		reply = 'Lights are *'+ cmd +'*';
	}
	else if(cmd == "colorloop")
	{
		json.effect = "colorloop";
		reply = "Start *colorloop*";
	}
	else if(cmd.charAt(0) == "#" && cmd.length == 7)
	{
		var clr = convertColor(cmd);
		json.xy = [clr.x,clr.y];
		reply = "Change color to *" + cmd + "*";
	}
	else if(cmd in color)
	{
		var clr = color[cmd];
		json.xy = [clr[0],clr[1]];
		reply = "Change color to *" + cmd + "*";
	}
	else
	{
		text = '{}';
		json = JSON.parse(text);
		reply = 'Not a valid command!';
	}
	
	return {
		json: json,
		reply: reply
	}
}

function generateConfig(cmd)
{
	var type = cmd[0];
	var id = parseInt(cmd[1]);
	
	var types = ['lights','groups'];
	
	if(!(types.indexOf(type) > -1) || isNaN(id)) { console.log("invalid"); return; }
	
	var selector = type=='lights' ? "state" : "action";
	
	var text = '{"type":"'+type+'","id":"'+id+'","selector":"'+selector+'"}';
	var json = JSON.parse(text);
	
	console.log(json);
	return json;	
}

function sendCommand(conf,cmd)
{
	var options = conf;	
	
	console.log(options.path);

	var req = http.request(options, function(res) {
	  res.setEncoding('utf8');
	  res.on('data', function (data) { });
	});

	req.on('error', function(e) {});
	
	console.log(cmd);
	req.write(JSON.stringify(cmd));
	req.end();
}

function getStatus()
{
	var data = '';
	var reply = 'Status unavailable';
	var options = {
	  host: hueIp,
	  path: '/api/'+ hueUsername +'/lights/',
	  method: 'GET',
	};
	
	callback = function(response) {
	  var str = ''
	  response.on('data', function (chunk) {
	    str += chunk;
	  });

	  response.on('end', function () {
	    console.log("end : " + str);
		
		var json = JSON.parse(str);
		
		var total = json.length;
		var active = 0;
		
		for (var key in json) {
		  if (json.hasOwnProperty(key)) {
			  if(json[key].state.on)
				  active++;
		  	console.log(json[key].state.on);
		  }
		}
		
		console.log(active + ' lights are on');
		
		reply = active + ' lights are on';
	  });
	}
	
	var req = http.request(options, callback);
	req.end();
	
	return reply;
}

function convertColor(hex)
{	
	var rgb = hex2rgb(hex);
	var gamma = gammaCorrection(rgb);
	var wide = rgb2XYZ(gamma);
	var color = XYZ2xy(wide);
	
	return {
		x: color.x,
		y: color.y
	}
}

function hex2rgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) /255
    } : null;
}

function gammaCorrection(c)
{	
	return {
		r: (c.r > 0.04045) ? Math.pow((c.r + 0.055) / (1.0 + 0.055), 2.4) : (c.r / 12.92),
		g: (c.g > 0.04045) ? Math.pow((c.g + 0.055) / (1.0 + 0.055), 2.4) : (c.g / 12.92),
		b: (c.b > 0.04045) ? Math.pow((c.b + 0.055) / (1.0 + 0.055), 2.4) : (c.b / 12.92)
	} 
}

function rgb2XYZ(c)
{	
	return{
		x: c.r * 0.664511 + c.g * 0.154324 + c.b * 0.162028,
		y: c.r * 0.283881 + c.g * 0.668433 + c.b * 0.047685,
		z: c.r * 0.000088 + c.g * 0.072310 + c.b * 0.986039
	}
}

function XYZ2xy(c)
{	
	return {
		x: c.x / (c.x + c.y + c.z),
		y: c.y / (c.x + c.y + c.z)
	}
}