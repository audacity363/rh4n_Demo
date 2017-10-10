// Base of the code: https://jsfiddle.net/rtoal/wvp4scLL/
var canvas = {
    element: document.getElementById('canvas'),
    width: 600,
    height: 400,
    initialize: function () {
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        document.body.appendChild(this.element);
    }
};

var Ball = {
    // dx = speed
    create: function (color, dx, dy, id) {
        var newBall = Object.create(this);
        newBall.dx = dx;
        newBall.dy = dy;
        newBall.width = 40;
        newBall.height = 40;
        newBall.element = document.createElement('div');
        newBall.element.style.backgroundColor = color;
        newBall.element.style.width = newBall.width + 'px';
        newBall.element.style.height = newBall.height + 'px';
        newBall.element.className += ' ball';
        newBall.element.id = "ball_"+id;
        newBall.element.innerHTML = id;
        newBall.width = parseInt(newBall.element.style.width);
        newBall.height = parseInt(newBall.element.style.height);
        canvas.element.appendChild(newBall.element);
        newBall.id = id;
        return newBall;
    },
    moveTo: function (x, y) {
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
    },
    changeDirectionIfNecessary: function (x, y) {
        if (x < 0 || x > canvas.width - this.width) {
            this.dx = -this.dx;
        }
        if (y < 0 || y > canvas.height - this.height) {
            this.dy = -this.dy;
        }
    },
    draw: function (x, y) {
        this.moveTo(x, y);
        this.g_x = x;
        this.g_y = y;
        var ball = this;
        this.move = setTimeout(function () {
            ball.changeDirectionIfNecessary(x, y);
            ball.draw(x + ball.dx, y + ball.dy);
        }, 1000 / 60);
    },
    pause: function() {
        console.log("delete timeout");
        clearTimeout(this.move);
    },
    play: function() {
        this.draw(this.g_x, this.g_y);
    },
    getID: function() {
        return this.id;
    }
};

console.log("Draw balls");
canvas.initialize();

balls = []

/*balls[0] =  Ball.create("blue", 4, 3, 1);
balls[1] =  Ball.create("red", 1, 5, 2);
balls[2] =  Ball.create("green", 2, 2, 3);

balls[0].draw(70, 0);
balls[1].draw(20, 200);
balls[2].draw(300, 330);*/

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function pauseAll(sendState) {
    for(let i=0; i < balls.length; i=i+1) {
        balls[i].pause();
    }
    $("#play_pause").html("Play");

    if(sendState) {
        $.ajax({
            'url': 'http://bonn.wgb.hal.hydro.com:8080/realHTML4Natural/projekt1/rh4n_demo?cmd=pause',
            'dataType': 'json'
            }
        ).done(function(data) {
            console.log(data);
        });
    }
}

function playAll(sendState) {
    for(let i=0; i < balls.length; i=i+1) {
        balls[i].play();
    }
    $("#play_pause").html("Pause");

    if(sendState) {
        $.ajax({
            'url': 'http://bonn.wgb.hal.hydro.com:8080/realHTML4Natural/projekt1/rh4n_demo?cmd=play',
            'dataType': 'json'
            }
        ).done(function(data) {
            console.log(data);
        });
    }
}

function toggleState() {
    if($("#play_pause").html() == "Pause") {
        console.log("pause", balls);
        pauseAll(true);
    } else {
        playAll(true);    
    }
}

$("#play_pause").click(toggleState);

function createNewBall(id, color) {
    return Ball.create(color, Math.floor(Math.random() * 10), 
        Math.floor(Math.random() * 10), id);
}

$("#addball").click(function() {
    let maxid = -1;

    for(let i=0; i < balls.length; i=i+1) {
        if(balls[i].getID() > maxid) {
            maxid = balls[i].getID();
        }
    }

    let newid = parseInt(maxid)+1;
    if (newid == "0") {
        newid = newid+1;
    } 
    let color = getRandomColor();

    balls[balls.length] = createNewBall(newid, color);
    balls[balls.length-1].draw(53, 84);
    $("#id-list").append("<option value='"+newid+"'>"+newid+"</option>");

    $.ajax({
        'url': 'http://bonn.wgb.hal.hydro.com:8080/realHTML4Natural/projekt1/rh4n_demo',
        'dataType': 'json',
        'data': {
            'cmd': 'addball',
            'id': newid,
            'color': color
        }
    }).done(function(data) {
        console.log(data);
    });
});

function deleteBall(id, sendStat) {
    console.log("Delete ball", id);
    for(let i=0; i < balls.length; i=i+1) {
        if(balls[i].getID() == id) {
            balls[i].pause();
            balls.splice(i, 1);
        }
    }
    $("#ball_"+id).remove();

    if(sendStat) {
        $.ajax({
            'url': 'http://bonn.wgb.hal.hydro.com:8080/realHTML4Natural/projekt1/rh4n_demo?cmd=deleteball&id='+id,
            'dataType': 'json'
        })
        .done(function (data) {
            console.log(data);
        })
    }
}

$("#deleteball").click(function (){
    let id = $("#id-list").find(":selected").val();
    deleteBall(id, true);
    $("#id-list").find(":selected").remove();
});

function updateData() {
    $.ajax({
        'url': "http://bonn.wgb.hal.hydro.com:8080/realHTML4Natural/projekt1/rh4n_demo?cmd=getinfos",
        'dataType': 'json'
    })
    .done(function(data) {
        console.log(data);
        let new_balls = [];

        //Check if balls where deleted
        for(let i=0; i < balls.length; i=i+1) {
            let found_ball = false;
            for(let x=0; x < data.balls.id.length; x=x+1) {
                if(balls[i].getID() == data.balls.id[x]) {
                    found_ball = true;
                }
            }

            if(!found_ball) {
                deleteBall(balls[i].getID(), false);
                $("#id-list").children("[val='"+balls[i].getID()+"']").remove();
            }
        }

        //Check if new balls where added
        for(let i=0; i < data.balls.id.length; i=i+1) {
            let ball_found = false;

            if(data.balls.id[i] == "0") {
                continue;
            }

            for(let x=0; x < balls.length; x=x+1) {
                if(balls[x].getID() == data.balls.id[i]) {
                    ball_found = true;
                    break;
                }
            }
            if(ball_found) {
                continue;
            }

            new_balls[new_balls.length] = createNewBall(data.balls.id[i], data.balls.color[i]);
        }

        for(let i=0; i < new_balls.length; i=i+1) {
            balls[balls.length] = new_balls[i];
            new_balls[i].draw(53, 84);
            $("#id-list").append("<option value='"+new_balls[i].getID()+"'>"+new_balls[i].getID()+"</option>");
        }

        //Check if the state changed
        if($("#play_pause").html() == "Pause" && data.state == false) {
            pauseAll(false);
        } else if($("#play_pause").html() == "Play" && data.state == true) {
            playAll(false);
        }
    });
}

updateData();
setInterval(updateData, 5000);