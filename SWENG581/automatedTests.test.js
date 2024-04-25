import test from 'tape'
import spacetime from '../lib/index.js'
import SpaceTime from '../../src/spacetime.js';

// 'Oct 30th, 8:00pm'
let valid = new SpaceTime({
    epoch: 1698710400000,
    tz: 'america/new_york',
    silent: true,
    british: undefined,
    _weekStart: 1,
    _today: {}
});

let invalid = new SpaceTime({
    epoch: null,
    tz: 'america/new_york',
    silent: true,
    british: undefined,
    _weekStart: 1,
    _today: {}
})

test('s.add(t)', (t) => {
    let s = spacetime('October 31, 2023 9:00:00', 'America/New_York');

    /**
     * Test adding 3 weeks
     *  input:
     *      date:   31 (October 31, 2023)
     *      num:    3
     *      unit:   week
     *  expected output:
     *      21 (November 21, 2023)
     */
    t.equals(s.add(3, 'week').date(), 21, '(3, week)');

    /**
     * Test adding 3 hours
     *  input:
     *      hour: 9 (9:00am)
     *      num: 3
     *      unit: hour
     *  expected output:
     *      12 (12:00pm)
     */
    t.equals(s.add(3, 'hour').hour(), 12, '(3, hour)');
    
    /**
     * Test adding 3 quarters
     *  input:
     *      quarter:    4 (4th quarter of the year)
     *      num:        3
     *      unit:       quarter
     *  expected output:
     *      3 (3rd quarter of the following year)
     */
    t.equals(s.add(3, 'quarter').quarter(), 3,'(3, quarter)')
    
    /**
     * Test adding 3 centuries
     *  input:
     *      year:   2023 (current year)
     *      num:    3
     *      unit:   century
     *  expected output:
     *      2323
     * This unit seems to be broken as the definition is hard coded to only add 100 years. It will fail.
     */
    t.equals(s.add(3, 'century').year(), 2323, '(3, century)'); 

    /**
     * Test adding a negative (-2 weeks)
     *  input:
     *      date:   31 (October 31, 2023)
     *      num:    -2
     *      unit:   week
     *  expected output:
     *      17
     */
    t.equals(s.add(-2, 'week').date(), 17, '(-2. Week)');

    /**
     * Test adding 0 weeks
     *  input:
     *      date:   31 (October 31, 2023)
     *      num:    0
     *      unit:   week
     *  expected output:
     *      31
     */
    t.equals(s.add(0, 'week').date(), 31,  '(0, week)');

    t.end()
});

test('s.timezone()', (t) => {
    
    /**
     * Test valid date with no Daylight Savings Time (DST) and with a defined timezone
     *  input:  
     *      s: {
                epoch: 1698710400000,
                tz: 'utc',
                silent: true,
                british: undefined,
                _weekStart: 1,
                _today: {} 
            }
        expected output:
            {
                name: 'Utc',
                hasDst: false,
                default_offset: 0,
                hemisphere: 'North',
                current: { offset: 0, isDST: false }
            }
     */
    let s = new SpaceTime({
        epoch: 1698710400000,
        tz: 'utc',
        silent: true,
        british: undefined,
        _weekStart: 1,
        _today: {} 
    });

    let ss = {
        name: 'Utc',
        hasDst: false,
        default_offset: 0,
        hemisphere: 'North',
        current: { offset: 0, isDST: false }
    };      

    t.deepEquals(s.timezone(), ss, 'b1.timezone()')

    /**
     *  Test a valid date with DST and a defined timezone
     *      input:
     *          s: {
                    epoch: 1698724800000,
                    tz: 'america/new_york',
                    silent: true,
                    british: undefined,
                    _weekStart: 1,
                    _today: {}
                }
            expected output:
                {
                    name: 'America/New_York',
                    hasDst: true,
                    default_offset: -4,
                    hemisphere: 'North',
                    current: { offset: -4, isDST: true },
                    change: { start: '03/12:02', back: '11/05:02' }
                }
     *          
     */
    s = new SpaceTime({
        epoch: 1698724800000,
        tz: 'america/new_york',
        silent: true,
        british: undefined,
        _weekStart: 1,
        _today: {}
    });

    ss = {
        name: 'America/New_York',
        hasDst: true,
        default_offset: -4,
        hemisphere: 'North',
        current: { offset: -4, isDST: true },
        change: { start: '03/12:02', back: '11/05:02' }
    }
      
    t.deepEquals(s.timezone(), ss, 'b2.timezone()');

    /**
     * Test a valid date where a timezone has not been defined. Program should guess Timezone based on machine's local time
     *  input:
     *      s: {
                    epoch: 1698710400000,
                    tz: null,
                    silent: true,
                    british: undefined,
                    _weekStart: 1,
                    _today: {}
                }
     *  expected output:
            {
                name: 'America/New_York',
                hasDst: true,
                default_offset: -4,
                hemisphere: 'North',
                current: { offset: -4, isDST: true },
                change: { start: '03/12:02', back: '11/05:02' }
            }
     */
    s = new SpaceTime({
        epoch: 1698710400000,
        tz: null,
        silent: true,
        british: undefined,
        _weekStart: 1,
        _today: {}
    });

    ss = {
        name: 'America/New_York',
        hasDst: true,
        default_offset: -4,
        hemisphere: 'North',
        current: { offset: -4, isDST: true },
        change: { start: '03/12:02', back: '11/05:02' }
    }      

    t.deepEquals(s.timezone(), ss, 'b3.timezone()');

    /**
     * Test getting timezone information on an invalid date. Program will use default date and guess timezone based on local Machine
     *  input: 
     *      s: {
                epoch: null,
                tz: 'america/new_york',
                silent: true,
                british: undefined,
                _weekStart: 1,
                _today: {}
            }
        expected putput:
        {
            name: 'America/New_York',
            hasDst: true,
            default_offset: -4,
            hemisphere: 'North',
            current: { offset: -5, isDST: false },
            change: { start: '03/12:02', back: '11/05:02' }
        }
     */

    s = new SpaceTime({
        epoch: null,
        tz: 'america/new_york',
        silent: true,
        british: undefined,
        _weekStart: 1,
        _today: {}
    });

    ss = {
        name: 'America/New_York',
        hasDst: true,
        default_offset: -4,
        hemisphere: 'North',
        current: { offset: -5, isDST: false },
        change: { start: '03/12:02', back: '11/05:02' }
    }

    t.deepEquals(s.timezone(), ss, 'b4.timezone()');

    t.end()
});

test('s.goto(tz)', (t) => {
    let s = new SpaceTime({
        epoch: 1698710400000,
        tz: 'america/new_york',
        silent: true,
        british: undefined,
        _weekStart: 1,
        _today: {}
    });
    /**
     * Test going to an IANA formatted timezone.
     *  input:
     *      s: {
                epoch: 1698710400000,
                tz: 'america/new_york',
                silent: true,
                british: undefined,
                _weekStart: 1,
                _today: {}
            }
            tz: America/Nassau
        expected output:
            {
                name: 'America/Nassau',
                hasDst: true,
                default_offset: -4,
                hemisphere: 'North',
                current: { offset: -4, isDST: true },
                change: { start: '03/12:02', back: '11/05:02' }
            }    
     */

    let ss = {
        name: 'America/Nassau',
        hasDst: true,
        default_offset: -4,
        hemisphere: 'North',
        current: { offset: -4, isDST: true },
        change: { start: '03/12:02', back: '11/05:02' }
    };

    t.deepEquals(s.goto('America/Nassau').timezone(), ss, 'b1.goto(America/Nassau)'); 

    /**
     * Test going to an null timezone. Will set to local machine timezone
     *  input:
     *      s: {
                epoch: 1698710400000,
                tz: 'america/new_york',
                silent: true,
                british: undefined,
                _weekStart: 1,
                _today: {}
            }
            tz: null
        expected output:
            {
                name: 'America/New_York',
                hasDst: true,
                default_offset: -4,
                hemisphere: 'North',
                current: { offset: -4, isDST: true },
                change: { start: '03/12:02', back: '11/05:02' }
            }    
     */

    ss = {
        name: 'America/New_York',
        hasDst: true,
        default_offset: -4,
        hemisphere: 'North',
        current: { offset: -4, isDST: true },
        change: { start: '03/12:02', back: '11/05:02' }
    };

    t.deepEquals(s.goto(null).timezone(), ss, 'b1.goto(null)');

    /**
     * Test going to an undefined timezone. Will set to local machine timezone
     *  input:
     *      s: {
                epoch: 1698710400000,
                tz: 'america/new_york',
                silent: true,
                british: undefined,
                _weekStart: 1,
                _today: {}
            }
            tz: undefined
        expected output:
            {
                name: 'America/New_York',
                hasDst: true,
                default_offset: -4,
                hemisphere: 'North',
                current: { offset: -4, isDST: true },
                change: { start: '03/12:02', back: '11/05:02' }
    */

    t.deepEquals(s.goto(undefined).timezone(), ss, 'b1.goto(undefined)');
    
    /**
     * Test going to an abbreviated timezone.
     *  input:
     *      s: {
                epoch: 1698710400000,
                tz: 'america/new_york',
                silent: true,
                british: undefined,
                _weekStart: 1,
                _today: {}
            }
            tz: 'gmt'
        expected output:
            {
                name: 'Etc/GMT',
                hasDst: true,
                default_offset: -4,
                hemisphere: 'North',
                current: { offset: -4, isDST: true },
                change: { start: '03/12:02', back: '11/05:02' }
    */
   ss = {
        name: 'Etc/GMT',
        hasDst: false,
        default_offset: 0,
        hemisphere: 'North',
        current: { offset: 0, isDST: false }
    };

    t.deepEquals(s.goto('gmt').timezone(), ss, 'b1.goto(gmt)');
    
    /**
     * Test going to an invalid timezone.
     *  input:
     *      s: {
                epoch: 1698710400000,
                tz: 'america/new_york',
                silent: true,
                british: undefined,
                _weekStart: 1,
                _today: {}
            }
            tz: '1234'
        expected output:
            throw error "Cannot find timezone named: '1234'. Please enter an IANA timezone id."
    */

    t.throws(() => {
        s.goto('1234').timezone()
    }, 's.goto(1234)');

    /**
     * Test going to a city based timezone.
     *  input:
     *      s: {
                epoch: 1698710400000,
                tz: 'america/new_york',
                silent: true,
                british: undefined,
                _weekStart: 1,
                _today: {}
            }
            tz: 'london'
        expected output:
            { 
                name: 'Europe/London', 
                hasDst: true, 
                default_offset: 1, 
                hemisphere: 'North', 
                current: { offset: 0, isDST: false }, 
                change: { start: '03/26:01', back: '10/29:02' } 
            }
    */

    ss = { 
        name: 'Europe/London', 
        hasDst: true, 
        default_offset: 1, 
        hemisphere: 'North', 
        current: { offset: 0, isDST: false }, 
        change: { start: '03/26:01', back: '10/29:02' } 
    }

    t.deepEquals(s.goto('london').timezone(), ss, 'b1.goto(london)');

    /**
     * Test going to a timezone based on time difference.
     *  input:
     *      s: {
                epoch: 1698710400000,
                tz: 'america/new_york',
                silent: true,
                british: undefined,
                _weekStart: 1,
                _today: {}
            }
            tz: '-5h'
        expected output:
             { 
                name: 'Etc/GMT+5', 
                hasDst: false, 
                default_offset: -5, 
                hemisphere: 'North', 
                current: { offset: -5, isDST: false } 
            }
    */

    ss = { 
        name: 'Etc/GMT+5', 
        hasDst: false, 
        default_offset: -5, 
        hemisphere: 'North', 
        current: { offset: -5, isDST: false } 
    }

    t.deepEquals(s.goto('-5h').timezone(), ss, 'b1.goto(-5h)');      

    /**
     * Test going to an IANA formatted timezone an invalid date. Program will use default date.
     *  input:
     *      s: {
                epoch: null,
                tz: 'america/new_york',
                silent: true,
                british: undefined,
                _weekStart: 1,
                _today: {}
            }
            tz: 'America/Nassau'
        expected output:
             { 
                name: 'Etc/GMT+5', 
                hasDst: false, 
                default_offset: -5, 
                hemisphere: 'North', 
                current: { offset: -5, isDST: false } 
            }
    */
   
    s = new SpaceTime({
        epoch: null,
        tz: 'america/new_york',
        silent: true,
        british: undefined,
        _weekStart: 1,
        _today: {}
    })

    ss = {
        name: 'America/Nassau',
        hasDst: true,
        default_offset: -4,
        hemisphere: 'North',
        current: { offset: -5, isDST: false },
        change: { start: '03/12:02', back: '11/05:02' }
    };

    t.deepEquals(s.goto('America/Nassau').timezone(), ss, 'b2.goto(America/Nassau)'); 

    t.end();
});

test('s.startOf(unit)', (t) => {

    /**
     * Test setting valid date to start of current day
     *  input:
     *      s:      valid (see definition at top of file)
     *      unit:   day
     *  expected output:
     *       12:00am
     */
    t.equals(valid.startOf('day').time(), '12:00am', 'b1.startOf(day)')

    /**
     * Test setting valid date to start of current seconds
     *  input:
     *      s:      valid (see definition at top of file)
     *      unit:   second
     *  expected output:
     *       0
     */

    t.equals(valid.startOf('second').second(), 0, 'b1.startOf(second)');

    /**
     * Test setting valid date to start of current minute
     *  input:
     *      s:      valid (see definition at top of file)
     *      unit:   minute
     *  expected output:
     *      0
     */

    t.equals(valid.startOf('minute').time(), '8:00pm', 'b1.startOf(minute)')
    
    /**
     * Test setting valid date to start of current quarterhour
     *  input:
     *      s:      valid (see definition at top of file)
     *      unit:   quarterhour
     *  expected output:
     *       8:00pm
     */

    t.equals(valid.startOf('quarterhour').time(), '8:00pm', 'b1.startOf(quarterhour)')

    /**
     * Test setting valid date to start of current hour
     *  input:
     *      s:      valid (see definition at top of file)
     *      unit:   hour
     *  expected output:
     *       8:00pm
     */

    t.equals(valid.startOf('hour').time(), '8:00pm', 'b1.startOf(hour)')

    /**
     * Test setting valid date to start of current week
     *  input:
     *      s:      valid (see definition at top of file)
     *      unit:   week
     *  expected output:
     *       44
     */

    t.equals(valid.startOf('week').week(), 44, 'b1.startOf(week)')

    /**
     * Test setting valid date to start of current month
     *  input:
     *      s:      valid (see definition at top of file)
     *      unit:   month
     *  expected output:
     *       10
     */

    t.equals(valid.startOf('month').month(), 9, 'b1.startOf(month)')

    /**
     * Test setting valid date to start of current quarter
     *  input:
     *      s:      valid (see definition at top of file)
     *      unit:   quarter
     *  expected output:
     *       4
     */

    t.equals(valid.startOf('quarter').quarter(), 4, 'b1.startOf(quarter)')

    /**
     * Test setting valid date to start of current season
     *  input:
     *      s:      valid (see definition at top of file)
     *      unit:   season
     *  expected output:
     *       2023-09-01
     */

    t.equals(valid.startOf('season').format(), '2023-09-01', 'b1.startOf(season)')
    
    /**
     * Test setting valid date to start of current year
     *  input:
     *      s:      valid (see definition at top of file)
     *      unit:   year
     *  expected output:
     *       2023-01-01
     */

    t.equals(valid.startOf('year').format(), '2023-01-01', 'b1.startOf(year)')

    /**
     * Test setting valid date to start of current decade
     *  input:
     *      s:      valid (see definition at top of file)
     *      unit:   decade
     *  expected output:
     *       2020
     */

    t.equals(valid.startOf('decade').year(), 2020, 'b1.startOf(decade)')

    /**
     * Test setting valid date to start of current century
     *  input:
     *      s:      valid (see definition at top of file)
     *      unit:   century
     *  expected output:
     *       2000
     */

    t.equals(valid.startOf('century').year(), 2000, 'b1.startOf(century)')

    /**
     * Test setting invalid date to start of current day
     *  input:
     *      s:      valid (see definition at top of file)
     *      unit:   day
     *  expected output:
     *       12:00am
     */

    t.equals(invalid.startOf('day').time(), '12:00am', 'b1.startOf(day)')

    t.end()
})

test('s1.isSame(s2, unit)', (t) => {
    let s = new SpaceTime({
        epoch: 1698714000000,
        tz: 'america/new_york',
        silent: true,
        british: undefined,
        _weekStart: 1,
        _today: {}
    });

    /**
     * Test if two different datetime have two different hour value
     *  input:
     *      s1:     s   (see definition above)
     *      s2:     valid   (see definition at top of file)
     *      unit:   hour
     *  output:
     *      false
     */

    t.equals(s.isSame(valid, 'hour'), false, 's1.isSame(s2, hour)')

    /**
     * Test if the same datetime objects have the same hour value
     *  input:
     *      s1:     s (see definition above)
     *      s2:     s (see definition above)
     *      unit:   hour
     *  output:
     *      true
     */

    t.equals(s.isSame(s, 'hour'), true, 's1.isSame(s2, hour)')

    t.end()
})

test('s.time(str)', (t) => {

    /**
     * Test if a time is returned when passing no value in for str
     *  input:
     *      s:      valid (see definition at top of file)
     *      str:    null
     *  output
     *      8:00pm
     */

    t.equals(valid.time(), '8:00pm', 's.time()')

    /**
     * Test new time is set when passing in time in 12hr format, am, with no minutes defined
     *  input:
     *      s:      valid (see definition at top of file)
     *      str:    1am
     *  output
     *      1:00am
     */

    t.equals(valid.time('1am').time(), '1:00am', 's.time(1am)')

    /**
     * Test new time is set when passing in time in 12hr format, pm, with no minutes defined
     *  input:
     *      s:      valid (see definition at top of file)
     *      str:    3pm
     *  output
     *      3:00pm
     */

    t.equals(valid.time('3pm').time(), '3:00pm', 's.time(3pm)')

    /**
     * Test new time is set when passing in time in 12hr format, am, with minutes defined
     *  input:
     *      s:      valid (see definition at top of file)
     *      str:    1:43am
     *  output
     *      1:43am
     */

    t.equals(valid.time('1:43am').time(), '1:43am', 's.time(1:43am)')

    /**
     * Test new time is set when passing in time in 12hr format, pm, with minutes defined
     *  input:
     *      s:      valid (see definition at top of file)
     *      str:    8:13pm
     *  output
     *      8:13pm
     */

    t.equals(valid.time('8:13pm').time(), '8:13pm', 's.time(8:13pm)')

    /**
     * Test new time is set when passing in time in 24hr format
     *  input:
     *      s:      valid (see definition at top of file)
     *      str:    16:00
     *  output
     *      4:00pm
     */

    t.equals(valid.time('16:00').time(), '4:00pm', 's.time(16:00)')

    /**
     * Test new time is set when passing in time in 12hr format, am, with no minutes defined on invalid date
     *  input:
     *      s:      invalid (see definition at top of file)
     *      str:    1am
     *  output
     *      1:00am
     */

    t.equals(invalid.time('1am').time(), '1:00am', 's.time(1am)')
    
    t.end()
})

/**
 * This function is defined a little funky, such as not being 0-index based - so the expected results work, but aren't
 *  super intuitive.
 */
test('s.week(num)', (t) => {

    /**
     * Test if passing no input value for num will return current week of the datetime
     *  input:
     *      s:      valid (see definition at top of file)
     *      num:    null
     *  output
     *      44
     */

    t.equals(valid.week(), 44, 's.week()')

    /**
     * Test if passing a negative value less than -52 for num will set the year back more than a year
     *  input:
     *      s:      valid (see definition at top of file)
     *      num:    -53
     *  output
     *      52
     */

    t.equals(valid.week(-53).week(), 52, 's.week(-53)')

    /**
     * Test if passing a negative value more than -52 and less than 0 for num will set the week back to the specified number
     *  input:
     *      s:      valid (see definition at top of file)
     *      num:    -3
     *  output
     *      50
     */

    t.equals(valid.week(-3).week(), 50, 's.week(-3)')

    /**
     * Test if passing a negative value of 0 for num set the week to first of the year
     *  input:
     *      s:      valid (see definition at top of file)
     *      num:    0
     *  output
     *      53
     */

    t.equals(valid.week(0).week(), 53, 's.week(0)')

    /**
     * Test if passing a value between 0 and 52 for num will change the week to the specified number
     *  input:
     *      s:      valid (see definition at top of file)
     *      num:    10
     *  output
     *      11
     */

    t.equals(valid.week(10).week(), 11, 's.week(10)')

    /**
     * Test if passing a value greater than 52 for num will change the week to the specified number
     *  input:
     *      s:      valid (see definition at top of file)
     *      num:    104
     *  output
     *      51
     */

    t.equals(valid.week(104).week(), 51, 's.week(104)')

    /**
     * Test if passing no input value for num will return current week of the datetime when creating an invalid time
     *  input:
     *      s:      invalid (see definition at top of file)
     *      num:    104
     *  output
     *      51
     */

    t.equals(invalid.week(), 1, 's.week()')

    t.end()
})

test('s.quarter(num)', (t) => {

    /**
     * Test if passing no input value for num will return current quarter of the datetime
     *  input:
     *      s:      valid (see definition at top of file)
     *      num:    null
     *  output
     *      4
     */

    t.equals(valid.quarter(), 4, 's.quarter()')

    /**
     * Test if passing a negative value less than -4 for num will set the quarter a year back
     *  input:
     *      s:      valid (see definition at top of file)
     *      num:    -5
     *  output
     *      4
     */

    t.equals(valid.quarter(-5), 4, 's.quarter(-5)')

    /**
     * Test if passing a negative value of 0 for num will also set the quarter a year back
     *  input:
     *      s:      valid (see definition at top of file)
     *      num:    0
     *  output
     *      4
     */

    t.equals(valid.quarter(0), 4, 's.quarter(0)')

    /**
     * Test if passing a value between 0 and 4 for num will set the quarter to the specified number
     *  input:
     *      s:      valid (see definition at top of file)
     *      num:    3
     *  output
     *      3
     */

    t.equals(valid.quarter(3).quarter(), 3, 's.quarter(3)')

    /**
     * Test if passing a value greater than 4 for num will set the quarter in future
     *  input:
     *      s:      valid (see definition at top of file)
     *      num:    6
     *  output
     *      4
     */

    t.equals(valid.quarter(6), 4, 's.week(6)')

    /**
     * Test if passing no input value for num will return current quarter of the invalid datetime
     *  input:
     *      s:      invalid (see definition at top of file)
     *      num:    null
     *  output
     *      4
     */

    t.equals(invalid.quarter(), 1, 's.quarter()')


    t.end();
})

test('s.season(str)', (t) => {

    /**
     * Test if a null input for str will return the current season
     *  input:
     *      s:      valid (see definition at top of file)
     *      str:    null
     *  expected output:
     *      autumn
     */

    t.equals(valid.season(), 'autumn', 's.season()')

    /**
     * Test if each value of seasonEnum for str will set the season to the entered season
     *  input:
     *      s:      valid (see definition at top of file)
     *      str:    seasonEnum[i]
     *  expected output:
     *      seasonEnum[i]
     */

    const seasonEnum = ['spring', 'summer', 'autumn', 'winter'];

    seasonEnum.forEach((e) => {
        t.equals(valid.season(e).season(), e, `s.season(${e})`)
    });

   /**
     * Test if a null input for str will return the current season for an invalid datetime
     *  input:
     *      s:      invalid (see definition at top of file)
     *      str:    null
     *  expected output:
     *      winter
     */

   t.equals(invalid.season(), 'winter', 's.season()')

    t.end();
})

test('s.monthName(str)', (t) => {

    /**
     * Test to see if passing a null value for str will return the month in text form
     *  input:
     *      s:      valid (see definition at top of file)
     *      str:    null
     *  output:
     *      october
     */

    t.equals(valid.monthName(), 'october', 's.monthName()')

    /**
     * Test if each value for monthEnum sets the month to number represented by the text form
     *  input:
     *      s:      valid (see definition at top of file)
     *      str:    monthEnum[i]
     * output:
     *      i
     */

    const monthEnum = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    monthEnum.forEach((e, i) => {
        t.equals(valid.monthName(e).month(), i, `s.monthName(${e})`)
    })

    /**
     * Test is a null value for str will return a value for the date that is generated when you pass in an invalid spacetime object
     *  input:
     *      s:      invalid (see definition at top of file)
     *      str:    null
     *  output:
     *      january
     */

    t.equals(invalid.monthName(), 'january', 's.monthName()')

    t.end()
});