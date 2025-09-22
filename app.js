
const http = require('http');
const url = require('url');

const availableTimes = {
    Monday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Tuesday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Wednesday: ["1:00", "1:30", "2:00", "2:30", "3:00", "4:00", "4:30"],
    Thursday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Friday: ["1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
};
const appointments = [
    {name: "James", day: "Wednesday", time: "3:30" },
    {name: "Lillie", day: "Friday", time: "1:00" }];

let serverObj =  http.createServer(function(req,res){
	console.log(req.url);
	let urlObj = url.parse(req.url,true);
	switch (urlObj.pathname) {
		case "/schedule":
			schedule(urlObj.query,res);
			break;
		case "/cancel":
			cancel(urlObj.query,res);
			break;
		case "/check":
			check(urlObj.query,res);
			break;
		default:
			error(res,404,"pathname unknown");

	}
});

function schedule(qObj,res) {
	if (availableTimes[qObj.day].some(time => time == qObj.time))
	{
		//removes the time from the array above (filter, test elements in the array)
		availableTimes[qObj.day] = availableTimes[qObj.day].filter(time => time !== qObj.time);
		
		//adds to the appointments array (push, to the end of the array)
		appointments.push({
           	   name: qObj.name,
		   day: qObj.day,
		   time: qObj.time
	        });

		res.writeHead(200,{'content-type':'text/plain'});
		res.write("scheduled");
		res.end();
	}
	else 
		error(res,400,"Can't schedule");

 
}



function cancel(qObj, res) {

    //finds the index of the appointment
    const index = appointments.findIndex(placeholder =>
        placeholder.name === qObj.name && placeholder.day === qObj.day && placeholder.time === qObj.time
    );

    if (index !== -1) {
        //removes the appointment
        appointments.splice(index, 1);

        //add the time back to availableTimes
        if (!availableTimes[qObj.day].some(time => time === qObj.time)) {
            availableTimes[qObj.day].push(qObj.time);
        }

        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write("Appointment has been canceled");
        res.end();
    } else {
        error(res, 404, "Appointment not found");
    }
}

function check(qObj, res){
    
    //Makes sure the day has available times, if not return
    if (!availableTimes[qObj.day]) {
        res.writeHead(400, { 'content-type': 'text/plain' });
        res.write("No appointment times are available on ${qObj.day}");
        res.end();
        return;
    }

    //Day is available, the following are the outputs
    if (availableTimes[qObj.day].some(time => time === qObj.time)) {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write(`The appointment at  ${qObj.time} on ${qObj.day} is available`);
    } else {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write(`The appointment at  ${qObj.time} on ${qObj.day} is not available`);
    }
    res.end();

}


function error(response,status,message) {

	response.writeHead(status,{'content-type':'text/plain'});
	response.write(message);
	response.end();
}

serverObj.listen(80,function(){console.log("listening on port 80")});
