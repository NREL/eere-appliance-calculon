/**
 *  Project: EERE Appliance Calculator
 *  Description: DOM manipulations and calculations
 *  Author: Michael Oakley <moakley.oakley@nrel.gov>
 */

$(document).ready(function(){
    'use strict';

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
    var applianceTmplSrc = $('#appliance-template').html()
      , applianceTemplate = Handlebars.compile( applianceTmplSrc )
      , applianceHtml = applianceTemplate( JSON.parse( $('#appliance-data').html() ) )

    $appliances.append( applianceHtml )


    // prevent FOUC
    $appliances.wrap( function() {
        var h = $( this ).css('height')
        return '<div style="height: ' + h + '" class="fouc-placeholder"></div>'
    })

    $appliances.addClass('selectpicker')
    $appliances.removeClass('invisible')

    var stateTmplSrc = $('#state-template').html()
      , stateTemplate = Handlebars.compile( stateTmplSrc )
      , stateHtml = stateTemplate( JSON.parse( $('#state-data').html() ) )
    $states.append( stateHtml )

    $states.wrap( function() {
        var h = $( this ).css('height')
        return '<div style="height: ' + h + '" class="fouc-placeholder"></div>'
    })

    $states.addClass('selectpicker')
    $states.removeClass('invisible')



    var apiConfig = {
        url: '//api.eia.gov/series/'
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
          , watts = $watts.val()
          , hours = $hours.val()
          , days = $days.val()
          , rate = $states.val()

        $controls.each( function(){
            return (completed = $(this).val() ? true : false)
        });

        if (completed) {

            energy = watts * hours *  days / 1000 // convert watts to kilowatts
            cost = Math.round( energy * rate ) / 100// convert rate from cents to dollars

            //console.log('Energy use: '+watts+'W * '+hours+'h/day * '+days+'day/yr * 1kW/1000W = '+energy+'kWh/yr')
            //console.log('Cost: Round( ' +energy+ 'kWh/yr * '+rate+'cents/kWh ) = '+Math.round( energy * rate )+'cents/yr * $1/100cents = $'+cost)

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
     *  NB: the API returns values as cents per kilowatthour
     */
    $states.on( 'change', function( event ){

        var state = event.currentTarget
          , optnum = state.selectedIndex
          , option = state[ optnum ]
          , statecode = option.dataset.stateCode
          , jqxhr = new $.Deferred()
          , rate

        if ( !option.value ) {

            jqxhr = getStateRate( statecode )

            jqxhr.done( function(results){
                rate = Math.round( results.series[0].data[0][1] ) // round our utility rate
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

        $watts.val( event.currentTarget.value )

    })


    /**
     *
     *  Catch the special case - refrigerator
     *
     */
    $('.appliance-group').on('rendered.bs.select', function(){

        var $option
          , appliance
          , tooltip

        $option = $(this).find('option:selected')

        if ( $option ) {
            appliance = $option.text()
        }

        tooltip = '' +
            '<i class="fa fa-info-circle small"' +
              'data-toggle="popover" data-placement="bottom" data-trigger="hover"' +
              'data-content="Refrigerators cycle on and off. Total time plugged in (usually 24 hours) should be divided by 3 to estimate energy use at maximum wattage.">' +
            '</i>'

        if ( appliance === "Refrigerator") {

            $(this).find('.filter-option').append( tooltip )

            $('[data-toggle="popover"]').popover()

        }

        $hours.val( 8 )

    })


    /**
     *  When the user changes any control, recalculate the totals
     *  Delegate the binding for bootstrap-select
     */
    $( '#app' ).on( 'change', '.form-control', function(){
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