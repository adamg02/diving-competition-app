// FINA Dive Code Database with Height-Specific Difficulty Ratings
// Format: { code: 'XXX[A-D]', heights: { '1m': X.X, '3m': X.X, '5m': X.X, '7.5m': X.X, '10m': X.X }, description: 'Dive Name' }
// null values indicate the dive is not performed from that height

const FINA_DIVES_BY_HEIGHT = {
    // FORWARD GROUP (1XX)
    '101A': { heights: { '1m': 1.2, '3m': 1.4, '5m': 1.6, '7.5m': 1.6, '10m': 1.6 }, description: 'Forward Dive Straight' },
    '101B': { heights: { '1m': 1.1, '3m': 1.3, '5m': 1.5, '7.5m': 1.5, '10m': 1.5 }, description: 'Forward Dive Pike' },
    '101C': { heights: { '1m': 1.0, '3m': 1.2, '5m': 1.4, '7.5m': 1.4, '10m': 1.4 }, description: 'Forward Dive Tuck' },
    '102A': { heights: { '1m': 1.4, '3m': 1.6, '5m': 1.8, '7.5m': 1.8, '10m': 1.8 }, description: 'Forward Somersault Straight' },
    '102B': { heights: { '1m': 1.3, '3m': 1.5, '5m': 1.7, '7.5m': 1.7, '10m': 1.7 }, description: 'Forward Somersault Pike' },
    '102C': { heights: { '1m': 1.2, '3m': 1.4, '5m': 1.6, '7.5m': 1.6, '10m': 1.6 }, description: 'Forward Somersault Tuck' },
    '103A': { heights: { '1m': 1.5, '3m': 1.7, '5m': 1.9, '7.5m': 1.9, '10m': 1.9 }, description: 'Forward 1½ Somersaults Straight' },
    '103B': { heights: { '1m': 1.4, '3m': 1.6, '5m': 1.8, '7.5m': 1.7, '10m': 1.7 }, description: 'Forward 1½ Somersaults Pike' },
    '103C': { heights: { '1m': 1.3, '3m': 1.5, '5m': 1.7, '7.5m': 1.6, '10m': 1.6 }, description: 'Forward 1½ Somersaults Tuck' },
    '104A': { heights: { '1m': 2.2, '3m': 2.4, '5m': 2.6, '7.5m': 2.6, '10m': 2.6 }, description: 'Forward 2 Somersaults Straight' },
    '104B': { heights: { '1m': 2.1, '3m': 2.3, '5m': 2.5, '7.5m': 2.5, '10m': 2.5 }, description: 'Forward 2 Somersaults Pike' },
    '104C': { heights: { '1m': 2.0, '3m': 2.2, '5m': 2.4, '7.5m': 2.4, '10m': 2.4 }, description: 'Forward 2 Somersaults Tuck' },
    '105A': { heights: { '1m': 2.4, '3m': 2.6, '5m': 2.8, '7.5m': 2.8, '10m': 2.8 }, description: 'Forward 2½ Somersaults Straight' },
    '105B': { heights: { '1m': 2.2, '3m': 2.4, '5m': 2.6, '7.5m': 2.6, '10m': 2.6 }, description: 'Forward 2½ Somersaults Pike' },
    '105C': { heights: { '1m': 2.0, '3m': 2.2, '5m': 2.4, '7.5m': 2.4, '10m': 2.4 }, description: 'Forward 2½ Somersaults Tuck' },
    '106A': { heights: { '1m': 2.7, '3m': 2.9, '5m': 3.1, '7.5m': 3.2, '10m': 3.2 }, description: 'Forward 3 Somersaults Straight' },
    '106B': { heights: { '1m': 2.5, '3m': 2.7, '5m': 2.9, '7.5m': 3.0, '10m': 3.0 }, description: 'Forward 3 Somersaults Pike' },
    '106C': { heights: { '1m': 2.3, '3m': 2.5, '5m': 2.7, '7.5m': 2.8, '10m': 2.8 }, description: 'Forward 3 Somersaults Tuck' },
    '107A': { heights: { '1m': null, '3m': 3.2, '5m': 3.4, '7.5m': 3.5, '10m': 3.5 }, description: 'Forward 3½ Somersaults Straight' },
    '107B': { heights: { '1m': null, '3m': 3.0, '5m': 3.2, '7.5m': 3.3, '10m': 3.3 }, description: 'Forward 3½ Somersaults Pike' },
    '107C': { heights: { '1m': null, '3m': 2.7, '5m': 2.9, '7.5m': 3.0, '10m': 3.0 }, description: 'Forward 3½ Somersaults Tuck' },
    '108B': { heights: { '1m': null, '3m': null, '5m': 3.3, '7.5m': 3.5, '10m': 3.5 }, description: 'Forward 4 Somersaults Pike' },
    '108C': { heights: { '1m': null, '3m': null, '5m': 2.9, '7.5m': 3.1, '10m': 3.1 }, description: 'Forward 4 Somersaults Tuck' },
    '109C': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 3.4, '10m': 3.4 }, description: 'Forward 4½ Somersaults Tuck' },
    
    // BACK GROUP (2XX)
    '201A': { heights: { '1m': 1.3, '3m': 1.5, '5m': 1.7, '7.5m': 1.7, '10m': 1.7 }, description: 'Back Dive Straight' },
    '201B': { heights: { '1m': 1.2, '3m': 1.4, '5m': 1.6, '7.5m': 1.6, '10m': 1.6 }, description: 'Back Dive Pike' },
    '201C': { heights: { '1m': 1.1, '3m': 1.3, '5m': 1.5, '7.5m': 1.5, '10m': 1.5 }, description: 'Back Dive Tuck' },
    '202A': { heights: { '1m': 1.5, '3m': 1.7, '5m': 1.9, '7.5m': 1.9, '10m': 1.9 }, description: 'Back Somersault Straight' },
    '202B': { heights: { '1m': 1.4, '3m': 1.6, '5m': 1.8, '7.5m': 1.8, '10m': 1.8 }, description: 'Back Somersault Pike' },
    '202C': { heights: { '1m': 1.3, '3m': 1.5, '5m': 1.7, '7.5m': 1.7, '10m': 1.7 }, description: 'Back Somersault Tuck' },
    '203A': { heights: { '1m': 1.8, '3m': 2.0, '5m': 2.2, '7.5m': 2.2, '10m': 2.2 }, description: 'Back 1½ Somersaults Straight' },
    '203B': { heights: { '1m': 1.6, '3m': 1.8, '5m': 2.0, '7.5m': 2.0, '10m': 2.0 }, description: 'Back 1½ Somersaults Pike' },
    '203C': { heights: { '1m': 1.5, '3m': 1.7, '5m': 1.9, '7.5m': 1.8, '10m': 1.8 }, description: 'Back 1½ Somersaults Tuck' },
    '204A': { heights: { '1m': 2.3, '3m': 2.5, '5m': 2.7, '7.5m': 2.7, '10m': 2.7 }, description: 'Back 2 Somersaults Straight' },
    '204B': { heights: { '1m': 2.1, '3m': 2.3, '5m': 2.5, '7.5m': 2.5, '10m': 2.5 }, description: 'Back 2 Somersaults Pike' },
    '204C': { heights: { '1m': 2.0, '3m': 2.2, '5m': 2.4, '7.5m': 2.3, '10m': 2.3 }, description: 'Back 2 Somersaults Tuck' },
    '205A': { heights: { '1m': 2.6, '3m': 2.8, '5m': 3.0, '7.5m': 3.0, '10m': 3.0 }, description: 'Back 2½ Somersaults Straight' },
    '205B': { heights: { '1m': 2.4, '3m': 2.6, '5m': 2.8, '7.5m': 2.8, '10m': 2.8 }, description: 'Back 2½ Somersaults Pike' },
    '205C': { heights: { '1m': 2.2, '3m': 2.4, '5m': 2.6, '7.5m': 2.6, '10m': 2.6 }, description: 'Back 2½ Somersaults Tuck' },
    '206A': { heights: { '1m': 2.9, '3m': 3.1, '5m': 3.3, '7.5m': 3.3, '10m': 3.3 }, description: 'Back 3 Somersaults Straight' },
    '206B': { heights: { '1m': 2.7, '3m': 2.9, '5m': 3.1, '7.5m': 3.1, '10m': 3.1 }, description: 'Back 3 Somersaults Pike' },
    '206C': { heights: { '1m': 2.5, '3m': 2.7, '5m': 2.9, '7.5m': 2.9, '10m': 2.9 }, description: 'Back 3 Somersaults Tuck' },
    '207A': { heights: { '1m': null, '3m': 3.4, '5m': 3.6, '7.5m': 3.6, '10m': 3.6 }, description: 'Back 3½ Somersaults Straight' },
    '207B': { heights: { '1m': null, '3m': 3.2, '5m': 3.4, '7.5m': 3.4, '10m': 3.4 }, description: 'Back 3½ Somersaults Pike' },
    '207C': { heights: { '1m': null, '3m': 2.9, '5m': 3.1, '7.5m': 3.1, '10m': 3.1 }, description: 'Back 3½ Somersaults Tuck' },
    
    // REVERSE GROUP (3XX)
    '301A': { heights: { '1m': 1.4, '3m': 1.6, '5m': 1.8, '7.5m': 1.8, '10m': 1.8 }, description: 'Reverse Dive Straight' },
    '301B': { heights: { '1m': 1.3, '3m': 1.5, '5m': 1.7, '7.5m': 1.7, '10m': 1.7 }, description: 'Reverse Dive Pike' },
    '301C': { heights: { '1m': 1.2, '3m': 1.4, '5m': 1.6, '7.5m': 1.6, '10m': 1.6 }, description: 'Reverse Dive Tuck' },
    '302A': { heights: { '1m': 1.6, '3m': 1.8, '5m': 2.0, '7.5m': 2.0, '10m': 2.0 }, description: 'Reverse Somersault Straight' },
    '302B': { heights: { '1m': 1.5, '3m': 1.7, '5m': 1.9, '7.5m': 1.9, '10m': 1.9 }, description: 'Reverse Somersault Pike' },
    '302C': { heights: { '1m': 1.4, '3m': 1.6, '5m': 1.8, '7.5m': 1.8, '10m': 1.8 }, description: 'Reverse Somersault Tuck' },
    '303A': { heights: { '1m': 1.9, '3m': 2.1, '5m': 2.3, '7.5m': 2.3, '10m': 2.3 }, description: 'Reverse 1½ Somersaults Straight' },
    '303B': { heights: { '1m': 1.7, '3m': 1.9, '5m': 2.1, '7.5m': 2.1, '10m': 2.1 }, description: 'Reverse 1½ Somersaults Pike' },
    '303C': { heights: { '1m': 1.6, '3m': 1.8, '5m': 2.0, '7.5m': 1.9, '10m': 1.9 }, description: 'Reverse 1½ Somersaults Tuck' },
    '304A': { heights: { '1m': 2.4, '3m': 2.6, '5m': 2.8, '7.5m': 2.8, '10m': 2.8 }, description: 'Reverse 2 Somersaults Straight' },
    '304B': { heights: { '1m': 2.2, '3m': 2.4, '5m': 2.6, '7.5m': 2.6, '10m': 2.6 }, description: 'Reverse 2 Somersaults Pike' },
    '304C': { heights: { '1m': 2.1, '3m': 2.3, '5m': 2.5, '7.5m': 2.4, '10m': 2.4 }, description: 'Reverse 2 Somersaults Tuck' },
    '305A': { heights: { '1m': 2.7, '3m': 2.9, '5m': 3.1, '7.5m': 3.1, '10m': 3.1 }, description: 'Reverse 2½ Somersaults Straight' },
    '305B': { heights: { '1m': 2.5, '3m': 2.7, '5m': 2.9, '7.5m': 2.9, '10m': 2.9 }, description: 'Reverse 2½ Somersaults Pike' },
    '305C': { heights: { '1m': 2.3, '3m': 2.5, '5m': 2.7, '7.5m': 2.7, '10m': 2.7 }, description: 'Reverse 2½ Somersaults Tuck' },
    '306A': { heights: { '1m': 3.0, '3m': 3.2, '5m': 3.4, '7.5m': 3.4, '10m': 3.4 }, description: 'Reverse 3 Somersaults Straight' },
    '306B': { heights: { '1m': 2.8, '3m': 3.0, '5m': 3.2, '7.5m': 3.2, '10m': 3.2 }, description: 'Reverse 3 Somersaults Pike' },
    '306C': { heights: { '1m': 2.6, '3m': 2.8, '5m': 3.0, '7.5m': 3.0, '10m': 3.0 }, description: 'Reverse 3 Somersaults Tuck' },
    '307C': { heights: { '1m': null, '3m': 3.0, '5m': 3.2, '7.5m': 3.2, '10m': 3.2 }, description: 'Reverse 3½ Somersaults Tuck' },
    
    // INWARD GROUP (4XX)
    '401A': { heights: { '1m': 1.2, '3m': 1.4, '5m': 1.6, '7.5m': 1.6, '10m': 1.6 }, description: 'Inward Dive Straight' },
    '401B': { heights: { '1m': 1.1, '3m': 1.3, '5m': 1.5, '7.5m': 1.5, '10m': 1.5 }, description: 'Inward Dive Pike' },
    '401C': { heights: { '1m': 1.0, '3m': 1.2, '5m': 1.4, '7.5m': 1.4, '10m': 1.4 }, description: 'Inward Dive Tuck' },
    '402A': { heights: { '1m': 1.4, '3m': 1.6, '5m': 1.8, '7.5m': 1.8, '10m': 1.8 }, description: 'Inward Somersault Straight' },
    '402B': { heights: { '1m': 1.3, '3m': 1.5, '5m': 1.7, '7.5m': 1.7, '10m': 1.7 }, description: 'Inward Somersault Pike' },
    '402C': { heights: { '1m': 1.2, '3m': 1.4, '5m': 1.6, '7.5m': 1.6, '10m': 1.6 }, description: 'Inward Somersault Tuck' },
    '403A': { heights: { '1m': 1.8, '3m': 2.0, '5m': 2.2, '7.5m': 2.2, '10m': 2.2 }, description: 'Inward 1½ Somersaults Straight' },
    '403B': { heights: { '1m': 1.6, '3m': 1.8, '5m': 2.0, '7.5m': 2.0, '10m': 2.0 }, description: 'Inward 1½ Somersaults Pike' },
    '403C': { heights: { '1m': 1.5, '3m': 1.7, '5m': 1.9, '7.5m': 1.8, '10m': 1.8 }, description: 'Inward 1½ Somersaults Tuck' },
    '404A': { heights: { '1m': 2.3, '3m': 2.5, '5m': 2.7, '7.5m': 2.7, '10m': 2.7 }, description: 'Inward 2 Somersaults Straight' },
    '404B': { heights: { '1m': 2.1, '3m': 2.3, '5m': 2.5, '7.5m': 2.5, '10m': 2.5 }, description: 'Inward 2 Somersaults Pike' },
    '404C': { heights: { '1m': 2.0, '3m': 2.2, '5m': 2.4, '7.5m': 2.3, '10m': 2.3 }, description: 'Inward 2 Somersaults Tuck' },
    '405A': { heights: { '1m': 2.6, '3m': 2.8, '5m': 3.0, '7.5m': 3.0, '10m': 3.0 }, description: 'Inward 2½ Somersaults Straight' },
    '405B': { heights: { '1m': 2.4, '3m': 2.6, '5m': 2.8, '7.5m': 2.8, '10m': 2.8 }, description: 'Inward 2½ Somersaults Pike' },
    '405C': { heights: { '1m': 2.2, '3m': 2.4, '5m': 2.6, '7.5m': 2.6, '10m': 2.6 }, description: 'Inward 2½ Somersaults Tuck' },
    '406B': { heights: { '1m': 2.7, '3m': 2.9, '5m': 3.1, '7.5m': 3.1, '10m': 3.1 }, description: 'Inward 3 Somersaults Pike' },
    '406C': { heights: { '1m': 2.5, '3m': 2.7, '5m': 2.9, '7.5m': 2.9, '10m': 2.9 }, description: 'Inward 3 Somersaults Tuck' },
    '407C': { heights: { '1m': null, '3m': 2.9, '5m': 3.1, '7.5m': 3.1, '10m': 3.1 }, description: 'Inward 3½ Somersaults Tuck' },
    
    // TWISTING GROUP (5XXX) - Selected common dives
    '5122B': { heights: { '1m': 1.4, '3m': 1.6, '5m': null, '7.5m': null, '10m': null }, description: 'Forward Dive ½ Twist Pike' },
    '5124D': { heights: { '1m': 1.8, '3m': 2.0, '5m': null, '7.5m': null, '10m': null }, description: 'Forward Dive 1 Twist Free' },
    '5132D': { heights: { '1m': 1.8, '3m': 2.0, '5m': null, '7.5m': null, '10m': null }, description: 'Forward Somersault ½ Twist Free' },
    '5134D': { heights: { '1m': 2.0, '3m': 2.2, '5m': 2.4, '7.5m': 2.3, '10m': 2.3 }, description: 'Forward Somersault 1 Twist Free' },
    '5136D': { heights: { '1m': 2.2, '3m': 2.4, '5m': 2.6, '7.5m': 2.5, '10m': 2.5 }, description: 'Forward Somersault 1½ Twists Free' },
    '5138D': { heights: { '1m': 2.5, '3m': 2.7, '5m': 2.9, '7.5m': 2.8, '10m': 2.8 }, description: 'Forward Somersault 2 Twists Free' },
    '5152B': { heights: { '1m': 2.2, '3m': 2.4, '5m': 2.6, '7.5m': 2.6, '10m': 2.6 }, description: 'Forward 1½ Somersaults ½ Twist Pike' },
    '5154B': { heights: { '1m': 2.5, '3m': 2.7, '5m': 2.9, '7.5m': 2.9, '10m': 2.9 }, description: 'Forward 1½ Somersaults 1 Twist Pike' },
    '5156B': { heights: { '1m': 2.8, '3m': 3.0, '5m': 3.2, '7.5m': 3.2, '10m': 3.2 }, description: 'Forward 1½ Somersaults 1½ Twists Pike' },
    '5233D': { heights: { '1m': 2.0, '3m': 2.2, '5m': 2.4, '7.5m': 2.4, '10m': 2.4 }, description: 'Back Dive ½ Twist Free' },
    '5235D': { heights: { '1m': 2.3, '3m': 2.5, '5m': 2.7, '7.5m': 2.7, '10m': 2.7 }, description: 'Back Dive 1 Twist Free' },
    '5237D': { heights: { '1m': 2.6, '3m': 2.8, '5m': 3.0, '7.5m': 3.0, '10m': 3.0 }, description: 'Back Dive 1½ Twists Free' },
    '5251B': { heights: { '1m': 2.2, '3m': 2.4, '5m': 2.6, '7.5m': 2.6, '10m': 2.6 }, description: 'Back Somersault ½ Twist Pike' },
    '5253B': { heights: { '1m': 2.5, '3m': 2.7, '5m': 2.9, '7.5m': 2.9, '10m': 2.9 }, description: 'Back Somersault 1 Twist Pike' },
    '5255B': { heights: { '1m': 2.8, '3m': 3.0, '5m': 3.2, '7.5m': 3.2, '10m': 3.2 }, description: 'Back Somersault 1½ Twists Pike' },
    '5333D': { heights: { '1m': 2.1, '3m': 2.3, '5m': 2.5, '7.5m': 2.5, '10m': 2.5 }, description: 'Reverse Dive ½ Twist Free' },
    '5335D': { heights: { '1m': 2.4, '3m': 2.6, '5m': 2.8, '7.5m': 2.8, '10m': 2.8 }, description: 'Reverse Dive 1 Twist Free' },
    '5337D': { heights: { '1m': 2.7, '3m': 2.9, '5m': 3.1, '7.5m': 3.1, '10m': 3.1 }, description: 'Reverse Dive 1½ Twists Free' },
    '5351B': { heights: { '1m': 2.3, '3m': 2.5, '5m': 2.7, '7.5m': 2.7, '10m': 2.7 }, description: 'Reverse Somersault ½ Twist Pike' },
    '5353B': { heights: { '1m': 2.6, '3m': 2.8, '5m': 3.0, '7.5m': 3.0, '10m': 3.0 }, description: 'Reverse Somersault 1 Twist Pike' },
    
    // ARMSTAND GROUP (6XX) - Platform only
    '601A': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 1.5, '10m': 1.5 }, description: 'Armstand Dive Straight' },
    '601B': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 1.4, '10m': 1.4 }, description: 'Armstand Dive Pike' },
    '601C': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 1.3, '10m': 1.3 }, description: 'Armstand Dive Tuck' },
    '602A': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 1.7, '10m': 1.7 }, description: 'Armstand Somersault Straight' },
    '602B': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 1.6, '10m': 1.6 }, description: 'Armstand Somersault Pike' },
    '602C': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 1.5, '10m': 1.5 }, description: 'Armstand Somersault Tuck' },
    '603A': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 2.0, '10m': 2.0 }, description: 'Armstand 1½ Somersaults Straight' },
    '603B': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 1.8, '10m': 1.8 }, description: 'Armstand 1½ Somersaults Pike' },
    '603C': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 1.7, '10m': 1.7 }, description: 'Armstand 1½ Somersaults Tuck' },
    '604B': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 2.2, '10m': 2.2 }, description: 'Armstand 2 Somersaults Pike' },
    '604C': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 2.1, '10m': 2.1 }, description: 'Armstand 2 Somersaults Tuck' },
    '605B': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 2.5, '10m': 2.5 }, description: 'Armstand 2½ Somersaults Pike' },
    '605C': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 2.4, '10m': 2.4 }, description: 'Armstand 2½ Somersaults Tuck' },
    '606B': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 2.8, '10m': 2.8 }, description: 'Armstand 3 Somersaults Pike' },
    '606C': { heights: { '1m': null, '3m': null, '5m': null, '7.5m': 2.6, '10m': 2.6 }, description: 'Armstand 3 Somersaults Tuck' },
};

// Function to lookup dive information by FINA code and height
function getDiveInfo(finaCode, boardHeight) {
    const normalizedCode = finaCode.toUpperCase().trim();
    const dive = FINA_DIVES_BY_HEIGHT[normalizedCode];
    
    if (!dive) {
        return null;
    }
    
    const difficulty = dive.heights[boardHeight];
    
    // Return null if dive is not available at this height
    if (difficulty === null || difficulty === undefined) {
        return null;
    }
    
    return {
        difficulty: difficulty,
        description: dive.description
    };
}

// Function to validate FINA code format
function isValidFinaCode(code) {
    const normalizedCode = code.toUpperCase().trim();
    // Basic FINA code format: 1-4 digits followed by A-D
    const finaPattern = /^[1-6]\d{2,3}[A-D]$/;
    return finaPattern.test(normalizedCode);
}

// Function to check if a dive is available at a specific height
function isDiveAvailableAtHeight(finaCode, boardHeight) {
    const normalizedCode = finaCode.toUpperCase().trim();
    const dive = FINA_DIVES_BY_HEIGHT[normalizedCode];
    
    if (!dive) {
        return false;
    }
    
    const difficulty = dive.heights[boardHeight];
    return difficulty !== null && difficulty !== undefined;
}
