class PlayAudio {

    private damage:HTMLAudioElement;
    private attack:HTMLAudioElement;
    private music:HTMLAudioElement;
    private death:HTMLAudioElement;
    private arrowFire:HTMLAudioElement;

    constructor() {
        this.damage = new Audio('./assets/damage.mp3');
        this.attack = new Audio('./assets/attack.mp3');
        this.music = new Audio('./assets/purpose.mp3');
        this.death = new Audio('./assets/defeated.mp3');
        this.arrowFire = new Audio('./assets/arrowFire.mp3');
    }

    playDamage() {
        this.damage.play().catch((err) => {
            console.log(err.message);
        });
    }

    playArrow() {
        this.arrowFire.play().catch((err) => {
            console.log(err.message);
        });
    }

    playDeath() {
        this.death.play().catch((err) => {
            console.log(err.message);
        });
    }

    playAttack() {
        this.attack.play().catch((err) => {
            console.log(err.message);
        });
    }

    playMusic() {
        this.music.play().catch((err) => {
            console.log(err.message);
        });
    }

}

let playerSingleton = new PlayAudio();

export default playerSingleton;