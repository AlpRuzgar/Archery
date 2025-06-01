// ------------------- StartScene -------------------

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
    }

    create() {
        let isDragging = false;
        let dragStartX, dragStartY;
        let dragStopX, dragStopY;
        let dragOffsetX, dragOffsetY;
        let power = 10;

        this.itemSpawnInterval = 1000; // item spawn aralığı
        this.itemSpawnTimer = 0;
        this.bombSpawnInterval = 2000; // 2 saniyede bir bomba spawn etme
        this.bombSpawnTimer = 0;

        this.hearts = 3; // Oyuncunun canı

        this.physics.world.setBounds(0, 0, config.width, config.height); // Oyun alanının sınırlarını ayarla

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

        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                isDragging = true;
                dragStartX = pointer.x;
                dragStartY = pointer.y;
            }
        });

        this.input.on('pointerup', (pointer) => {
            if (isDragging) {
                isDragging = false;
                dragStopX = pointer.x;
                dragStopY = pointer.y;

                dragOffsetX = dragStartX - dragStopX; // ters yön = geri çekme
                dragOffsetY = dragStartY - dragStopY;
                if (dragOffsetX != 0 && dragOffsetY != 0) {
                    this.shootArrow(dragOffsetX * power, dragOffsetY * power);
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
        for (let index = config.width / 2; index < config.width; index += 100) { // 100 piksel aralıklarla X koordinatlarını ekle
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
        for (let index = config.width / 2; index < config.width; index += 100) { // 100 piksel aralıklarla X koordinatlarını ekle
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
    scene: [GameScene, GameOverScene, WinScene]
};

const game = new Phaser.Game(config);