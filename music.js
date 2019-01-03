class PlayAudio {

    constructor() {
        this.damage = new Audio('./assets/damage.mp3');
        this.attack = new Audio('./assets/attack.mp3');
        this.music = new Audio('./assets/purpose.mp3');
        this.death = new Audio('./assets/defeated.mp3');
    }

    playDamage() {
        this.damage.play().catch((err) => {
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