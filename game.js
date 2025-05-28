// ------------------- StartScene -------------------

// ------------------- GameScene -------------------
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('item', 'assets/coin.png');
        this.load.image('bomb', 'assets/bombCopy.png');
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

        //Player oluşturma
        let player = this.physics.add.sprite(150, config.height / 2, 'player');
        player.setCollideWorldBounds(true); // Oyuncu dünya sınırlarına çarptığında duracak
        player.body.setAllowGravity(false); // Oyuncunun yerçekimi etkisi
        player.body.setImmovable(true); // Oyuncu hareket edemeyecek

        //gruplar
        this.arrows = this.physics.add.group();
        this.itemsButtom = this.physics.add.group();
        this.itemsTop = this.physics.add.group();
        this.bombsButtom = this.physics.add.group();
        this.bombsTop = this.physics.add.group();

        //overlaplar
        this.physics.add.overlap(this.arrows, this.itemsTop, this.hitItem, null, this);
        this.physics.add.overlap(this.arrows, this.itemsButtom, this.hitItem, null, this);
        this.physics.add.overlap(this.arrows, this.bombsTop, this.hitBomb, null, this);
        this.physics.add.overlap(this.arrows, this.bombsButtom, this.hitBomb, null, this);

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
                this.addItemTop();
            } else {
                this.addItemBottom();
            }
            this.itemSpawnTimer = 0;
        }

        // Bomba spawn etme
        this.bombSpawnTimer += delta;
        if (this.bombSpawnTimer >= this.bombSpawnInterval) {
            if (Phaser.Math.Between(0, 1) === 0) {
                this.addBombTop();
            } else {
                this.addBombBottom();
            }
            this.bombSpawnTimer = 0;
        }

        //kaçan itemleri silme
        this.itemsTop.children.each((item) => {
            if (item.y > config.height + 50) {
                item.destroy();
            }
        });

        this.itemsButtom.children.each((item) => {
            if (item.y < -50) {
                item.destroy();
            }
        }
        );
    }

    shootArrow(x, y) {
        let arrow = this.arrows.create(150, config.height / 2, 'arrow');
        arrow.setVelocity(x, y);
    }

    //Item ekleme
    addItemTop() {
        let xArray = [];
        for (let index = config.width / 2; index < config.width; index += 100) {
            xArray.push(index);
        }
        let x = xArray[Phaser.Math.Between(0, xArray.length - 1)];
        let y = Phaser.Math.Between(-100, -300);

        let itemTop = this.itemsTop.create(x, y, 'item');
        itemTop.scale = 0.12; // Item boyutunu ayarla
        itemTop.body.setAllowGravity(false); // Itemlerin yerçekimi etkisi olmasın
        itemTop.setVelocityY(Phaser.Math.Between(100, 300));
    }

    addItemBottom() {
        let xArray = [];
        for (let index = config.width / 2; index < config.width; index += 100) {
            xArray.push(index);
        }
        let x = xArray[Phaser.Math.Between(0, xArray.length - 1)];
        let y = Phaser.Math.Between(config.height + 100, config.height + 300);

        let itemButtom = this.itemsButtom.create(x, y, 'item');
        itemButtom.scale = 0.12; // Item boyutunu ayarla
        itemButtom.body.setAllowGravity(false); // Itemlerin yerçekimi etkisi olmasın
        itemButtom.setVelocityY(Phaser.Math.Between(-100, -300));
    }

    //bomba ekleme
    addBombTop() { 
        let xArray = [];
        for (let index = config.width / 2; index < config.width; index += 100) {
            xArray.push(index);
        }
        let x = xArray[Phaser.Math.Between(0, xArray.length - 1)];
        let y = Phaser.Math.Between(-100, -300);

        let bombTop = this.bombsTop.create(x, y, 'bomb');
        bombTop.scale = 0.12;
        bombTop.body.setAllowGravity(false); // Bombaların yerçekimi etkisi olmasın
        bombTop.setVelocityY(Phaser.Math.Between(100, 300));
    }

    addBombBottom() {
        let xArray = [];
        for (let index = config.width / 2; index < config.width; index += 100) {
            xArray.push(index);
        }
        let x = xArray[Phaser.Math.Between(0, xArray.length - 1)];
        let y = Phaser.Math.Between(config.height + 100, config.height + 300);

        let bombButtom = this.bombsButtom.create(x, y, 'bomb');
        bombButtom.scale = 0.12;
        bombButtom.body.setAllowGravity(false); // Bombaların yerçekimi etkisi olmasın
        bombButtom.setVelocityY(Phaser.Math.Between(-100, -300));
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
            gravity: { y: 200 }, //item düşme hızını değiştirir
            debug: false
        }
    },
    scene: [GameScene, GameOverScene, WinScene]
};

const game = new Phaser.Game(config);