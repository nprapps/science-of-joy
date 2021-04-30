var CustomElement = require("../customElement.js")

class MixChannel extends CustomElement {
	constructor(){
		super();
		var { audio,play,slider } = this.elements
		//audio.src = './assets/synced/audio/soundscape_tech.mp3.mp3'
		play.addEventListener('click', this.onPlay)
		slider.addEventListener('input', this.onSlide)
		document.body.addEventListener('webstorypage',d=> {
			audio.pause();
			play.setAttribute("aria-pressed",'false');
			slider.style.opacity = 1;
			audio.volume = 0;
		});
	}
	static get observedAttributes(){
		return ['src']
	}

	static get boundMethods(){
		return ['onPlay','onSlide']
	}

	attributeChangedCallback(attr,was,value) {
		switch (attr){
			case 'src': 
				this.elements.audio.src = value;
				break
		}
	}

	onSlide(){
		var { audio, slider, play } = this.elements;
		if (audio.paused) audio.play();
		//console.log(slider.style)
		//slider.style.opacity = (slider.value < 0.3 ? 0.3 : slider.value)
		//console.log(slider.input)
		if (audio.paused){
			audio.play()
		}
		audio.volume = slider.value;
		if (slider.value > 0){
			play.setAttribute("aria-pressed",'true')
		}

		else {
			play.setAttribute("aria-pressed",'false')
		}
		//slider.style.backgroundOpacity = slider.value;
	}

	onPlay(){
		var { audio, play, slider } = this.elements;
		if (audio.paused){
				audio.play();
				play.setAttribute("aria-pressed",'true')
				//slider.setAttribute("disabled",'false');
				//slider.style.opacity = 1
				//console.log(slider.disabled)
				
			}
			else {
				audio.pause();
				play.setAttribute("aria-pressed",'false')
				//slider.style.opacity = 0.4
				//slider.setAttribute("disabled",'true');
				//console.log(slider.disabled)
			}
	}

	static get template(){
		return require("./_mix-channel.html")
	}
}

MixChannel.define("mix-channel")