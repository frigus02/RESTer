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
    constructor({ title, requestURI, action, secondaryAction, data, method, status }) {
        this.isItem = true;
        this.title = title;
        this.requestURI = requestURI;
        this.action = action;
        this.secondaryAction = secondaryAction;
        this.data = data;
        this.method = method;
        this.status = status;
    }
}

export class Subheader {
    constructor({ title, action }) {
        this.isSubheader = true;
        this.title = title;
        this.action = action;
    }
}
