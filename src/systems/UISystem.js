export class UISystem {
    constructor(scene) {
        this.scene = scene;
        this.elements = new Map();
        this.container = null;
    }

    createUI() {
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(1000);
    }

    createText(key, x, y, text, style = {}) {
        const defaultStyle = {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        };

        const textObject = this.scene.add.text(x, y, text, {
            ...defaultStyle,
            ...style
        });

        this.elements.set(key, textObject);
        this.container?.add(textObject);
        return textObject;
    }

    createButton(key, x, y, text, callback, style = {}) {
        const defaultStyle = {
            fontSize: '24px',
            color: '#00ff00',
            fontFamily: 'Arial'
        };

        const button = this.scene.add.text(x, y, text, {
            ...defaultStyle,
            ...style
        }).setInteractive();

        button.on('pointerover', () => button.setScale(1.1));
        button.on('pointerout', () => button.setScale(1));
        button.on('pointerdown', callback);

        this.elements.set(key, button);
        this.container?.add(button);
        return button;
    }

    createProgressBar(key, x, y, width, height, color = 0x00ff00) {
        const bg = this.scene.add.rectangle(x, y, width, height, 0x333333);
        const fill = this.scene.add.rectangle(x - width / 2, y, 0, height, color);
        fill.setOrigin(0, 0.5);

        this.elements.set(key, { bg, fill, width, height });
        this.container?.add([bg, fill]);
        return { bg, fill };
    }

    updateText(key, text) {
        const element = this.elements.get(key);
        if (element && element.setText) {
            element.setText(text);
        }
    }

    updateProgressBar(key, progress) {
        const element = this.elements.get(key);
        if (element && element.fill) {
            element.fill.width = element.width * Math.min(1, Math.max(0, progress));
        }
    }

    showElement(key) {
        const element = this.elements.get(key);
        if (element) {
            element.setVisible(true);
        }
    }

    hideElement(key) {
        const element = this.elements.get(key);
        if (element) {
            element.setVisible(false);
        }
    }

    removeElement(key) {
        const element = this.elements.get(key);
        if (element) {
            element.destroy();
            this.elements.delete(key);
        }
    }

    update(time, delta) {
        // Cập nhật UI nếu cần
    }

    destroy() {
        this.elements.forEach(element => element.destroy());
        this.elements.clear();
        this.container?.destroy();
    }
}
