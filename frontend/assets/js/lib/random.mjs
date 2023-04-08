export class Random {
    seed;

    constructor(seed) {
        this.seed = seed || Math.floor(Math.random() * 100);
    }

    next() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    get(limit) {
        return Math.floor(this.next() * limit);
    }
}
