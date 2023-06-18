chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const randBetween = (start, end) => {
        return Math.floor(Math.random() * end) + start;
    };
    const fillInput = (element, text) => {
        if (element) {
            element.focus();
            element.select();
            document.execCommand('insertText', false, text);
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };
    if (request.action_type) {
        switch (request.action_type) {
            case 'wcpay_fill_card_number':
                const cardInput =
                    document.querySelector('input[name="cardnumber"]') ||
                    document.querySelector('input[name="number"]');
                const expInput =
                    document.querySelector('input[name="exp-date"]') ||
                    document.querySelector('input[name="expiry"]');
                const CVCinput = document.querySelector('input[name="cvc"]');
                if (cardInput && request.card_number) {
                    fillInput(cardInput, request.card_number);
                    fillInput(
                        expInput,
                        randBetween(1, 12) +
                            '/' +
                            randBetween(
                                (new Date().getFullYear() % 100) + 1,
                                60
                            )
                    );
                    fillInput(CVCinput, randBetween(100, 999));
                }
                break;
        }
    }
});
