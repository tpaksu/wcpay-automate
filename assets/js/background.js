/**
 * Stripe test cards list by category => description => number.
 * The content script will fill the expiry date and CVC randomly.
 */
const StripeTestCards = {
    'Cards by brands': {
        'Visa - 4242424242424242': '4242424242424242',
        'Visa (debit) - 4000056655665556': '4000056655665556',
        'Mastercard - 5555555555554444': '5555555555554444',
        'Mastercard (2-series) - 2223003122003222': '2223003122003222',
        'Mastercard (debit) - 5200828282828210': '5200828282828210',
        'Mastercard (prepaid) - 5105105105105100': '5105105105105100',
        'American Express - 378282246310005': '378282246310005',
        'American Express - 371449635398431': '371449635398431',
        'Discover - 6011111111111117': '6011111111111117',
        'Discover 2 - 6011000990139424': '6011000990139424',
        'Discover (debit) - 6011981111111113': '6011981111111113',
        'Diners Club - 3056930009020004': '3056930009020004',
        'Diners Club (14-digit card) - 36227206271667': '36227206271667',
        'BCcard and DinaCard - 6555900000604105': '6555900000604105',
        'JCB - 3566002020360505': '3566002020360505',
        'UnionPay - 6200000000000005': '6200000000000005',
        'UnionPay (debit) - 6200000000000047': '6200000000000047',
        'UnionPay (19-digit card) - 6205500000000000004': '6205500000000000004',
    },
    'Cards by country': {
        'United States (US) - 4242424242424242': '4242424242424242',
        'Argentina (AR) - 4000000320000021': '4000000320000021',
        'Brazil (BR) - 4000000760000002': '4000000760000002',
        'Canada (CA) - 4000001240000000': '4000001240000000',
        'Mexico (MX) - 4000004840008001': '4000004840008001',
    },
    'Declined Payments': {
        'Generic decline - 4000000000000002': '4000000000000002',
        'Insufficient funds decline - 4000000000009995': '4000000000009995',
        'Lost card decline - 4000000000009987': '4000000000009987',
        'Stolen card decline - 4000000000009979': '4000000000009979',
        'Expired card decline - 4000000000000069': '4000000000000069',
        'Incorrect CVC decline - 4000000000000127': '4000000000000127',
        'Processing error decline - 4000000000000119': '4000000000000119',
        'Incorrect number decline - 4242424242424241': '4242424242424241',
    },
    'Fraud Prevention': {
        'Always blocked - 4100000000000019': '4100000000000019',
        'Highest risk - 4000000000004954': '4000000000004954',
        'Elevated risk - 4000000000009235': '4000000000009235',
        'CVC check fails - 4000000000000101': '4000000000000101',
        'Postal code check fails - 4000000000000036': '4000000000000036',
        'Line1 check fails - 4000000000000028': '4000000000000028',
        'Address checks fail - 4000000000000010': '4000000000000010',
        'Address unavailable - 4000000000000044': '4000000000000044',
    },
    Disputes: {
        'Fraudulent - 4000000000000259': '4000000000000259',
        'Not received - 4000000000002685': '4000000000002685',
        'Inquiry - 4000000000001976': '4000000000001976',
        'Warning - 4000000000005423': '4000000000005423',
    },
    Refunds: {
        'Asynchronous success - 4000000000007726': '4000000000007726',
        'Asynchronous failure - 4000000000005126': '4000000000005126',
    },
    'Available Balance': {
        'Bypass pending balance (US) 4000000000000077': '4000000000000077',
        'Bypass pending balance (Int) 4000003720000278': '4000003720000278',
    },
    '3D Secure Authentication': {
        'Authenticate unless set up - 4000002500003155': '4000002500003155',
        'Always authenticate - 4000002760003184': '4000002760003184',
        'Already set up - 4000003800000446': '4000003800000446',
        'Insufficient funds - 4000008260003178': '4000008260003178',
    },
    'Payments with PINs': {
        'Offline PIN - 4001007020000002': '4001007020000002',
        'Offline PIN retry - 4000008260000075': '4000008260000075',
        'Online PIN - 4001000360000005': '4001000360000005',
        'Online PIN retry - 4000002760000008': '4000002760000008',
    },
};

// Converts strings to keys.
const makeKey = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => '-' + chr)
        .trim();
};

// Chrome sendmessage wrapper for the current active tab.
const sendMessage = async (message) => {
    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        await chrome.tabs.sendMessage(tab.id, message);
    } catch (err) {}
};

// Sends the card number update message.
const setCardFields = (number) => {
    sendMessage({
        action_type: 'wcpay_fill_card_number',
        card_number: number,
    });
};

// Creates the context menus.
const createMenus = () => {
    chrome.contextMenus.create({
        title: 'Stripe test cards',
        id: 'wcpay_test_cards',
    });

    for (let category in StripeTestCards) {
        const categoryKey = makeKey(category);
        chrome.contextMenus.create({
            title: category,
            id: categoryKey,
            parentId: 'wcpay_test_cards',
        });
        for (let cardDescription in StripeTestCards[category]) {
            chrome.contextMenus.create({
                title: cardDescription,
                id: makeKey(cardDescription),
                parentId: categoryKey,
            });
        }
    }
};

createMenus();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (sender.tab) {
        switch (request.action_type) {
            case 'wcpay_keep_alive':
                sendResponse({ status: 'ok' });
                break;
            default:
                sendResponse({ status: 'ok' });
                break;
        }
    }
});

chrome.contextMenus.onClicked.addListener((clickData) => {
    const parentId = clickData.parentMenuItemId;
    const menuId = clickData.menuItemId;
    for (let category in StripeTestCards) {
        if (parentId === makeKey(category)) {
            for (let cardDescription in StripeTestCards[category]) {
                if (menuId === makeKey(cardDescription)) {
                    setCardFields(StripeTestCards[category][cardDescription]);
                    break;
                }
            }
            break;
        }
    }
});
