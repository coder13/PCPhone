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
		addMessage(data.from, data.content);
	});


	$("#conncection").on("click", function(data) {
		client.iosocket.emit('update');
	});

});

function update(which) {
	if (!which) {
		$("#battery").text(phone.battery);
		$("#uptime").text(phone.uptime);
	} else {
		$("#" + which).text(phone[which]);
	}
}

function addMessage(from, content) {
	console.log(from, content);
	notify(from, content);
}

