$(document).ready(function(){

    // DOM caching
    var $controls = $('.form-control')
      , $inputgroups = $('.input-group')
      , $appliances = $('#appliances')
      , $watts= $('#watts')
      , $hours= $('#hours')
      , $days = $('#days')
      , $states = $('#states')
      , $energy = $('#energy')
      , $cost = $('#cost')
      , $integers = $('.integer-input')


    // set up our templating
    applianceTmplSrc = $('#appliance-template').html()
    applianceTemplate = Handlebars.compile( applianceTmplSrc )
    applianceHtml = applianceTemplate( JSON.parse( $('#appliance-data').html() ) )
    $appliances.append( applianceHtml )


    // prevent FOUC
    $appliances.wrap( function() {
        var h = $( this ).css('height')
        return '<div style="height: ' + h + '" class="fouc-placeholder"></div>'
    })

    $appliances.addClass('selectpicker')
    $appliances.removeClass('invisible')

    stateTmplSrc = $('#state-template').html()
    stateTemplate = Handlebars.compile( stateTmplSrc )
    stateHtml = stateTemplate( JSON.parse( $('#state-data').html() ) )
    $states.append( stateHtml )

    $states.wrap( function() {
        var h = $( this ).css('height')
        return '<div style="height: ' + h + '" class="fouc-placeholder"></div>'
    })

    $states.addClass('selectpicker')
    $states.removeClass('invisible')



    var apiConfig = {
        url: 'http://api.eia.gov/series/'
      , api_key: '4A8DA35AF7501244A974E9603C4FF11B'
      , series_id: 'ELEC.PRICE.XX-RES.Q'
    }


    /**
     *   Toggle focus/active state visual
     */
    var setActiveState = function( $group ){
        $inputgroups.removeClass('active')
        $group.addClass('active')
    }



    /**
     *  Calculate energy use and cost in the widget results box
     */
    var recalculate = function(){
        console.log('Recalculating')

        var energy = 0
          , cost   = 0
          , completed = false

        $controls.each( function(){
            return (completed = $(this).val() ? true : false)
        });

        if (completed) {
            energy = $watts.val() * $hours.val() *  $days.val()
            cost = energy * $states.val() / 100 // convert to $

            $energy.html(  energy + ' kWh')
            $cost.html( '$' + cost )
        }
    }

    /**
     *  Get utility rate data from EIA API
     */
    var getStateRate = function( statecode ){

        var series_id = apiConfig.series_id.replace( 'XX', statecode )

        return $.ajax({
            type: 'GET'
          , dataType: 'json'
          , url: apiConfig.url
          , data: {
                api_key: apiConfig.api_key
              , series_id: series_id
            }
        });

    }

    /**
     *  Restrict the type=number <inputs> to integers
     */
    $integers.on( 'change', function(event){
        event.currentTarget.value = Math.round(event.currentTarget.value)
    })

    /**
     *  Helper function
     *  Update DOM option data attr for bootstrap-select
     */
    var updateSubtext = function( rate, index ){
        $states.find('option:eq('+index+')').data('subtext', '$0.'+rate+'/kWh');
        $states.selectpicker('refresh');
    }

    /**
     *  Update the utility rate info displayed in the bootstrap-select dropdown and button
     */
    $states.on( 'change', function( event ){

        var state = event.currentTarget
          , optnum = state.selectedIndex
          , option = state[ optnum ]
          , statecode = option.dataset.stateCode
          , jqxhr = new $.Deferred
          , rate

        if (!option.value) {

            jqxhr = getStateRate( statecode )

            jqxhr.done( function(results){
                rate = Math.round( results.series[0].data[0][1] )
                option.value = rate
                updateSubtext( rate, optnum )
                recalculate()
            })

            jqxhr.fail( function(){ alert('Error fetching rate data')})

        } else {
            rate = option.value
            updateSubtext( rate, optnum )
        }

    })


    /**
     *  When the user changes appliances, update the wattage to match the new appliance
     */
    $( '#appliances' ).on( 'change', function( event ){
        console.log( 'setting watts to ' , event.currentTarget.value )
        $watts.val( event.currentTarget.value )
    })


    /**
     *  When the user changes any control, recalculate the totals
     *  Delegate the binding for bootstrap-select
     */
    $( '#app' ).on( 'change', '.form-control', function( event ){
        recalculate()
    })


    /**
     *  When the user focuses on any control, highlight the whole parent group visually
     *  Delegate the binding for bootstrap-select
     */
    $( '#app' ).on( 'focus', '.form-control', function( event ){
        var $group = $(event.currentTarget).parents('.input-group')
        setActiveState($group)
    })

});