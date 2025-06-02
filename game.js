// ------------------- Start Scene -------------------

class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }



    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('start-button', 'assets/ui/start_button.png');
        this.load.image('game-title', 'assets/ui/title.png');
        this.load.image('sound-on', 'assets/ui/sound_on.png');    // Ses açık ikonu
        this.load.image('sound-off', 'assets/ui/sound_off.png');  // Ses kapalı ikonu


        this.load.audio('background-music', 'assets/sounds/backgroundMusic.mp3');
        this.load.audio('gameover-sound', 'assets/sounds/gameover.mp3');
        this.load.audio('buttonClick', 'assets/sounds/button-click.mp3');
    }

    create() {

        this.sound.stopAll();
        this.buttonClickSound = this.sound.add('buttonClick');


        // Arka plan
        let background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.setDisplaySize(config.width, config.height);

        // SES BUTONU
        this.isSoundOn = true;
        this.soundButton = this.add.image(config.width - 50, 50, 'sound-on');
        this.soundButton.setDepth(10); // Ses butonunu öne al
        this.soundButton.setOrigin(0.5);
        this.soundButton.setScale(0.15);
        this.soundButton.setInteractive({ useHandCursor: true });

        this.soundButton.on('pointerdown', () => {
            this.isSoundOn = !this.isSoundOn;

            if (this.isSoundOn) {
                this.soundButton.setTexture('sound-on');
                this.sound.mute = false;
            } else {
                this.soundButton.setTexture('sound-off');
                this.sound.mute = true;
            }
        });

        this.backgroundMusic = this.sound.add('background-music', { loop: true, volume: 0.5 });
        this.backgroundMusic.play();

        // Parlayan efekt - arka plan için overlay
        let glowGraphics = this.add.graphics();
        glowGraphics.fillStyle(0xffff00, 0.1);
        glowGraphics.fillRect(0, 0, 1000, 600);

        // Glow efekti animasyonu
        this.tweens.add({
            targets: glowGraphics,
            alpha: { from: 0.1, to: 0.2 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        // Game title image 
        let titleImage = this.add.image(config.width / 2, config.height / 2 - 100, 'game-title');
        titleImage.setOrigin(0.5, 0.5);
        titleImage.setScale(0.5);

        // Title image animasyon
        this.tweens.add({
            targets: titleImage,
            scaleX: { from: titleImage.scaleX, to: titleImage.scaleX * 1.05 },
            scaleY: { from: titleImage.scaleY, to: titleImage.scaleY * 1.05 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        // Buton
        let startButton = this.add.image(config.width / 2, config.width / 2 + 100, 'start-button');
        startButton.setScale(0.2);
        startButton.setInteractive({ useHandCursor: true });
        startButton.setDepth(2);


        // Buton için pulse efekti
        let buttonTween = this.tweens.add({
            targets: [startButton],
            scaleX: { from: startButton.scaleX, to: startButton.scaleX * 1.1 },
            scaleY: { from: startButton.scaleY, to: startButton.scaleY * 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Buton efektleri
        startButton.on('pointerover', () => {
            startButton.setScale(0.3);
            buttonTween.pause();
        });

        startButton.on('pointerout', () => {
            startButton.setScale(0.4);
            buttonTween.resume();
        });

        startButton.on('pointerdown', () => {
            this.buttonClickSound.play();
            startButton.disableInteractive();
            startButton.setVisible(false);
            this.scene.start('GameScene');

        });


    }

    update() {
        // Oyun başlangıcında yapılacak güncellemeler
    }
}

// ------------------- GameScene -------------------
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('item', 'assets/coin.png');
        this.load.image('bomb', 'assets/bombCopy.png');
        this.load.image('arrow', 'assets/arrow.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('background', 'assets/background.png');
        this.load.image('explosion', 'assets/explosion.png');

        this.load.image('sound-on', 'assets/ui/sound_on.png');    // Ses açık ikonu
        this.load.image('sound-off', 'assets/ui/sound_off.png');  // Ses kapalı ikonu

        this.load.audio('explosion', 'assets/sounds/bomb.mp3');
    }

    create() {
        this.itemSpawnInterval = 1000; // item spawn aralığı
        this.itemSpawnTimer = 0;
        this.bombSpawnInterval = 2000; // 2 saniyede bir bomba spawn etme
        this.bombSpawnTimer = 0;

        this.hearts = 3; // Oyuncunun canı

        this.explosionSound = this.sound.add('explosion');

        this.physics.world.setBounds(0, 0, config.width, config.height); // Oyun alanının sınırlarını ayarla

        // SES BUTONU
        this.isSoundOn = true;
        this.soundButton = this.add.image(config.width - 50, 50, 'sound-on');
        this.soundButton.setDepth(10); // Ses butonunu öne al
        this.soundButton.setOrigin(0.5);
        this.soundButton.setScale(0.15);
        this.soundButton.setInteractive({ useHandCursor: true });

        this.soundButton.on('pointerdown', () => {
            this.isSoundOn = !this.isSoundOn;

            if (this.isSoundOn) {
                this.soundButton.setTexture('sound-on');
                this.sound.mute = false;
            } else {
                this.soundButton.setTexture('sound-off');
                this.sound.mute = true;
            }
        });



        // Arka plan resmi
        let background = this.add.image(config.width / 2, config.height / 2, 'background');
        background.setDisplaySize(config.width, config.height); // Arka planın boyutunu ayarla

        //Player oluşturma
        let player = this.physics.add.sprite(250, config.height / 2 - 25, 'player');
        player.scale = 0.15; // Oyuncu boyutunu ayarla
        player.setCollideWorldBounds(true); // Oyuncu dünya sınırlarına çarptığında duracak
        player.body.setAllowGravity(false); // Oyuncunun yerçekimi etkisi
        player.body.setImmovable(true); // Oyuncu hareket edemeyecek

        //gruplar
        this.arrows = this.physics.add.group();
        this.bombs = this.physics.add.group();
        this.items = this.physics.add.group();

        //overlaplar
        this.physics.add.overlap(this.arrows, this.items, this.hitItem, null, this);
        this.physics.add.overlap(this.arrows, this.bombs, this.hitBomb, null, this);

        this.score = 0;

        this.scoreText = this.add.text(10, 10, 'Skor: 0', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });

        this.heartsText = this.add.text(10, 40, 'Can: 3', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });

        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.power = 10;


        this.trajectoryLine = this.add.graphics();
        this.trajectoryLine.setDepth(5); // Çizgiyi öne al


        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.isDragging = true;
                this.dragStartX = pointer.x;
                this.dragStartY = pointer.y;
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                let dragOffsetX = this.dragStartX - pointer.x;
                let dragOffsetY = this.dragStartY - pointer.y;

                let velocityX = dragOffsetX * this.power;
                let velocityY = dragOffsetY * this.power;

                this.drawTrajectory(290, this.game.config.height / 2 - 45, velocityX, velocityY);
            }
        });

        this.input.on('pointerup', (pointer) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.trajectoryLine.clear();

                let dragStopX = pointer.x;
                let dragStopY = pointer.y;

                let dragOffsetX = this.dragStartX - dragStopX;
                let dragOffsetY = this.dragStartY - dragStopY;

                if (dragOffsetX !== 0 && dragOffsetY !== 0) {
                    this.shootArrow(dragOffsetX * this.power, dragOffsetY * this.power);
                }
            }
        });
    }

    update(time, delta) {
        // Item spawn etme
        this.itemSpawnTimer += delta;
        if (this.itemSpawnTimer >= this.itemSpawnInterval) {
            if (Phaser.Math.Between(0, 1) === 0) {
                this.addItem("top");
            } else {
                this.addItem("bottom");
            }
            this.itemSpawnTimer = 0;
        }

        // Bomba spawn etme
        this.bombSpawnTimer += delta;
        if (this.bombSpawnTimer >= this.bombSpawnInterval) {
            if (Phaser.Math.Between(0, 1) === 0) {
                this.addBomb("top");
            } else {
                this.addBomb("bottom");
            }
            this.bombSpawnTimer = 0;
        }

        this.items.children.each((item) => {
            if (item.from == 'top' && item.y > config.height + 50) {
                item.destroy();
            } else if (item.from == 'bottom' && item.y < -50) {
                item.destroy();
            }
        });

        this.bombs.children.each((bomb) => {
            if (bomb.from == 'top' && bomb.y > config.height + 50) {
                bomb.destroy();
            } else if (bomb.from == 'bottom' && bomb.y < -50) {
                bomb.destroy();
            }
        });

        //oku gittiği yöne göre döndürme ve kaçan okları silme
        this.arrows.children.each((arrow) => {
            let angleRad = Math.atan2(arrow.body.velocity.y, arrow.body.velocity.x);
            let angleDeg = Phaser.Math.RadToDeg(angleRad);
            arrow.setAngle(angleDeg + 23.5);
            if (arrow.y < -50 || arrow.y > config.height + 50) {
                arrow.destroy();
                console.log("arrow destroyed");
            }
        });
    }

    // Okun gideceği yöne göre çizgi çizme
    drawTrajectory(startX, startY, velocityX, velocityY) {
        this.trajectoryLine.clear();

        const gravity = this.physics.world.gravity.y;
        const timeStep = 0.05;
        const totalTime = 1.5;

        // Güce göre renk hesapla
        let power = Math.sqrt(velocityX ** 2 + velocityY ** 2);
        let color = Phaser.Display.Color.Interpolate.ColorWithColor(
            new Phaser.Display.Color(255, 255, 0), // sarı
            new Phaser.Display.Color(255, 0, 0),   // kırmızı
            1000,
            Math.min(power, 1000)
        );
        let hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

        this.trajectoryLine.lineStyle(2, hexColor, 1);

        // Nokta çizimi
        for (let t = 0; t < totalTime; t += timeStep) {
            let dx = velocityX * t;
            let dy = velocityY * t + 0.5 * gravity * t * t;

            let pointX = startX + dx;
            let pointY = startY + dy;

            // Ekran dışına taşmasın
            if (
                pointX < 0 || pointX > this.game.config.width ||
                pointY < 0 || pointY > this.game.config.height
            ) {
                break;
            }

            this.trajectoryLine.strokeCircle(pointX, pointY, 2); // 2px yarıçaplı nokta
        }
    }

    shootArrow(x, y) {
        let arrow = this.arrows.create(290, config.height / 2 - 45, 'arrow');
        arrow.scale = 0.05;
        arrow.setVelocity(x, y);
    }

    // Item ekleme
    addItem(locY) {
        let xArray = []; // X koordinatları için bir dizi oluştur
        let y;
        let velocity;
        for (let index = config.width / 2 + 100; index < config.width; index += 100) { // 100 piksel aralıklarla X koordinatlarını ekle
            xArray.push(index);
        }
        let x = xArray[Phaser.Math.Between(0, xArray.length - 1)];
        if (locY == 'top') { //yukarıda spawn olsun ve aşağı doğru gitsin
            y = Phaser.Math.Between(-100, -300);
            velocity = Phaser.Math.Between(100, 300);
        }
        else if (locY == 'bottom') { //aşağıda spawn olsun ve yukarı doğru gitsin
            y = Phaser.Math.Between(config.height + 100, config.height + 300);
            velocity = Phaser.Math.Between(-100, -300);
        }
        else {
            console.error('Geçersiz konum: ' + locY);
            return;
        }
        let item = this.items.create(x, y, 'item');
        item.from = locY; // Itemin konumunu kaydet
        item.scale = 0.12; // Item boyutunu ayarla
        item.body.setAllowGravity(false); // Itemlerin yerçekimi etkisi olmasın
        item.setVelocityY(velocity)
    }

    //bomba ekleme
    addBomb(locY) {
        let xArray = []; // X koordinatları için bir dizi oluştur
        let y;
        let velocity;
        for (let index = config.width / 2 + 100; index < config.width; index += 100) { // 100 piksel aralıklarla X koordinatlarını ekle
            xArray.push(index);
        }
        let x = xArray[Phaser.Math.Between(0, xArray.length - 1)];
        if (locY == 'top') { //yukarıda spawn olsun ve aşağı doğru gitsin
            y = Phaser.Math.Between(-100, -300);
            velocity = Phaser.Math.Between(100, 300);
        }
        else if (locY == 'bottom') { //aşağıda spawn olsun ve yukarı doğru gitsin
            y = Phaser.Math.Between(config.height + 100, config.height + 300);
            velocity = Phaser.Math.Between(-100, -300);
        }
        else {
            console.error('Geçersiz konum: ' + locY);
            return;
        }
        let bomb = this.bombs.create(x, y, 'bomb');
        bomb.from = locY; // Bombanın konumunu kaydet
        bomb.scale = 0.12; // Bomba boyutunu ayarla
        bomb.body.setAllowGravity(false); // Bombaların yerçekimi etkisi olmasın
        bomb.setVelocityY(velocity);
    }

    // Iteme vurma işlemi
    hitItem(arrow, item) {
        item.destroy(); // Itemi yok et
        arrow.destroy(); // Okun kendisini yok et
        this.score += 10; // Skoru artır
        this.scoreText.setText('Skor: ' + this.score); // Yazıyı güncelle
    }

    //bomba vurma işlemi
    hitBomb(arrow, bomb) {
        bomb.destroy(); // Bombayı yok et
        arrow.destroy(); // Okun kendisini yok et
        this.hearts -= 1; // Canı azalt
        this.heartsText.setText('Can: ' + this.hearts); // Can yazısını güncelle
        let explosion = this.add.image(bomb.x, bomb.y, 'explosion');
        explosion.setScale(0.5); // İstersen ayarla
        explosion.setDepth(10); // Önde gözükmesi için
        this.explosionSound.play(); // Patlama sesini çal

        // Patlama efekti yavaşça kaybolsun
        this.tweens.add({
            targets: explosion,
            alpha: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 800,
            onComplete: () => {
                explosion.destroy();
            }
        });
        if (this.hearts <= 0) {
            this.physics.pause() // Oyun bitti sahnesine geç
        }
    }
}

// ------------------- GameOverScene -------------------
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        // Gerekli assetleri yükleyebilirsiniz
    }

    create() {
        // Oyun bitti ekranını oluşturun
    }

    update() {
        // Oyun bitti ekranını güncelleyin
    }
}

// ------------------- WinScene -------------------
class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    preload() {
        // Gerekli assetleri yükleyebilirsiniz
    }

    create() {
        // Kazanma ekranını oluşturun
    }

    update() {
        // Kazanma ekranını güncelleyin
    }
}

// ------------------- Config -------------------
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 }, //item düşme hızını değiştirir
            debug: false
        }
    },
    scene: [StartScene, GameScene, GameOverScene, WinScene]
};

const game = new Phaser.Game(config);