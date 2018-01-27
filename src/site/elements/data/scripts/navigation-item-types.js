export class Divider {
    constructor() {
        this.isDivider = true;
    }
}

export class Group {
    constructor({ title, items = [] }) {
        this.isGroup = true;
        this.title = title;
        this.items = items;
    }
}


export class Item {
    constructor({ title, subtitle, action, secondaryAction, data }) {
        this.isItem = true;
        this.title = title;
        this.subtitle = subtitle;
        this.action = action;
        this.secondaryAction = secondaryAction;
        this.data = data;
    }
}

export class Subheader {
    constructor({ title, action }) {
        this.isSubheader = true;
        this.title = title;
        this.action = action;
    }
}
