function pad_digits(val) {
  return val.toString().padStart(2,'0')
}

function update_clock() {
  current_time=new Date()
  clock=[current_time.getHours(),current_time.getMinutes(),current_time.getSeconds()]
  clock=clock.map(pad_digits)
  display_time=clock.join(':')
  document.getElementById('display_time').innerHTML=display_time
}

function duration_string(milis) {
  seconds=Math.ceil(milis/1000)
  if (seconds<0) {
    seconds=0
  }

  display_seconds=seconds%60
  display_minutes=Math.floor(seconds/60)%60
  display_hours=Math.floor(seconds/3600)
  clock=[display_hours,display_minutes,display_seconds]
  clock=clock.map((x) => (x.toString().padStart(2,'0')))
  return clock.join(':')
}

function update_alarm_delay() {
  if (alarm_set) {
    remaining=target_time-current_time
    document.getElementById('alarm_delay').innerHTML=duration_string(remaining)
  }
}

function set_alarm() {
  current_time=new Date()
  hours=document.getElementById("alarm_hours").value
  minutes=document.getElementById("alarm_minutes").value
  target_time=new Date(current_time.getFullYear(),current_time.getMonth(),
    current_time.getDate(),hours,minutes)
  if (target_time<current_time) {
    target_time.setDate(target_time.getDate()+1)
  }
  ramp_start_time=new Date(target_time)
  ramp_duration=document.getElementById("minutes_ramp").value
  ramp_start_time.setMinutes(ramp_start_time.getMinutes()-ramp_duration)

  song=new Audio("resources/silence.mp3")
  song.volume=0
  song.play()

  music_files=document.getElementById("music_files").files
  if (music_files.length>0) {
    song_list=Array.from(music_files).map((x) => URL.createObjectURL(x))
  }

  alarm_set=true
  update_alarm_delay()
  set_display("alarm_delay","")
  set_display("alarm_set","none")
  document.getElementById("blink_video").play()
}

function set_display(id,value) {
  document.getElementById(id).style.display=value
}

function update_AV() {
  current_time=new Date()
  if (!alarm_set || current_time<ramp_start_time) {
    return
  }
  ramp_percentage=(current_time-ramp_start_time)/(ramp_duration*60*1000)
  if (ramp_percentage>1) {
    ramp_percentage=1
  }
  song.volume=ramp_percentage
  if (song.ended) {
    if (play_index.length==0) {
      play_index=Array.from(Array(song_list.length).keys())
      for (i=1; i<play_index.length; i++) {
        j=Math.floor(Math.random()*(i+1))
        tmp=play_index[i]
        play_index[i]=play_index[j]
        play_index[j]=tmp
      }
    }
    song=new Audio(song_list[play_index.pop()])
    song.volume=ramp_percentage
    song.play()
  }

  clr="#"+Math.round(ramp_percentage*255).toString(16).padStart(2,'0').repeat(3)
  document.getElementById("body").style.backgroundColor=clr
}

function end_alarm() {
  alarm_set=false
  set_display("alarm_delay","none")
  set_display("alarm_set","")
  document.getElementById("body").style.backgroundColor="#000000"
  song.pause()
  document.getElementById("blink_video").pause()
  play_index=[]
}


function update_callback() {
  update_clock()
  update_alarm_delay()
  update_AV()
}

var current_time=new Date()
suggested_time=current_time
suggested_time.setMinutes(suggested_time.getMinutes()+8*60+30)
document.getElementById("alarm_hours").value=pad_digits(suggested_time.getHours())
document.getElementById("alarm_minutes").value=pad_digits(suggested_time.getMinutes())
document.getElementById("blink_video").loop=true

var song
var target_time
var alarm_set=false
var song_list=["resources/upbeat.mp3"]
var play_index=[]

update_clock()
setInterval(update_callback,249)
