function similarity(first, second) {
    let longer = first, shorter = second;
    if (first.length < second.length) (longer = second) && (shorter = first);
    if (longer.length === 0) return 1.0;
    return (longer.length - deviation(longer, shorter)) / parseFloat(longer.length);
}

function deviation(first, second) {
    first = first.toLowerCase();
    second = second.toLowerCase();
    const costs = [];
    for (let i = 0; i <= first.length; i++) {
        let previous = i;
        for (let j = 0; j <= second.length; j++) {
            if (i === 0) costs[j] = j;
            else {
                if (j > 0) {
                    let replacement = costs[j - 1];
                    if (first.charAt(i - 1) !== second.charAt(j - 1))
                        replacement = Math.min(Math.min(replacement, previous), costs[j]) + 1;
                    costs[j - 1] = previous;
                    previous = replacement;
                }
            }
        }
        if (i > 0) costs[second.length] = previous;
    }
    return costs[second.length];
}

export {similarity};
