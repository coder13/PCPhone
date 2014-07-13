var app = {

}, phone = {

}, client = {
	connected: false
};

$(document).ready(function() {

	client.iosocket = io.connect();

	client.iosocket.on("connect", function () {
		$("#connection").removeClass('disconnected');
		$("#connection").addClass('connected');
		client.connected = true;
	});

	client.iosocket.on("disconnect", function() {
		$("#connection").removeClass('connected');
		$("#connection").addClass('disconnected');
		client.connected = false;
	});

	client.iosocket.on("update", function(data) {
		data = JSON.parse(data);
		if (data.phone) {
			phone = data.phone;
			update();
		} else {
			console.log(data.property, data.value);
			phone[data.property] = data.value;
			update(data.property);
		}
	});

	client.iosocket.on("message", function(data) {
		data = JSON.parse(data);
		phone.conversations[data.from].push({type:data.type|'received', content: data.content});
		addMessage(data.from, data.content, data.type|'received');
	});

	client.iosocket.on("contact", function(data) {
		contact = JSON.parse(data);
		console.log(contact);
		if (phone.contacts.indexOf(contact) == -1) {
			console.log('adding contact ' + contact);
			phone.contacts.push(contact);
			$("#contacts").append('<div class="contact" id="' + contact + '">' + contact + '</div>');
		}
	});


	$("#conncection").on("click", function(data) {
		client.iosocket.emit('update');
	});

});

function update(which) {
	if (!which) {
		$("#battery").text(phone.battery);
		$("#uptime").text(phone.uptime?time(phone.uptime) + "seconds":"");
	} else {
		if (which == "uptime")
			$("#uptime").text(phone.uptime?time(phone.uptime):"");
		else if (which == "contacts") {
			phone.contacts.forEach(function(i) {
				if (phone.contacts.indexOf(contact) == -1) {
					console.log('adding contact ' + contact);
					phone.contacts.push(contact);
					$("#contacts").append('<div class="contact" id="' + contact + '">' + contact + '</div>');
				}
			});
		} else {
			$("#" + which).text(phone[which]);
		}
	}
}

function time(t) {
	seconds = t % 60;
	minutes = Math.round(t/60)%60;
	hours = Math.round(t/3600)%24;
	days = Math.round(t/86400);
	return (days?days + " days ":"") + (hours?hours + " hours ":"") +
	(minutes?minutes + " minutes ":"") + (seconds?seconds + " seconds ":"");
}
 
function addMessage(from, content) {
	console.log(from, content);
	$("#messages").append('<div class="message">' + "from: " + from + "<br>said: " + content + "</div><hr>");
}

