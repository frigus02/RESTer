window.chrome = {
    runtime: {
        connect () {
            return {
                onMessage: {
                    addListener () {
                    }
                }
            };
        }
    }
};
