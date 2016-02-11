/**
 *  Project: EERE Appliance Calculator
 *  Description: DOM manipulations and calculations
 *  Author: Michael Oakley <moakley.oakley@nrel.gov>
 */

$(document).ready(function(){
    'use strict'

    // API configuration
    const apiConfig = {
        url: '//api.eia.gov/series/'
      , api_key: '4A8DA35AF7501244A974E9603C4FF11B'
      , series_id: 'ELEC.PRICE.XX-RES.Q'
    }

    // DOM caching
    const $controls = $('.form-control')
      , $inputgroups = $('.input-group')
      , $appliances = $('#appliances')
      , $watts= $('#watts')
      , $hours= $('#hours')
      , $days = $('#days')
      , $states = $('#states')
      , $energy = $('#energy')
      , $cost = $('#cost')
      , $integers = $('.integer-input')

    /**
     * addWrapper - helper function to add a div with inline height around a DOM element
     */
    function addWrapper() {
        const h = $( this ).css('height')
        return `<div style="height: ${h}" class="fouc-placeholder"></div>`
    }

    // set up our templating
    const applianceTmplSrc = $('#appliance-template').html()
      , applianceTemplate = Handlebars.compile( applianceTmplSrc )
      , applianceHtml = applianceTemplate( JSON.parse( $('#appliance-data').html() ) )

    $appliances.append( applianceHtml )


    // prevent FOUC
    $appliances.wrap( addWrapper() )

    $appliances.addClass('selectpicker')
    $appliances.removeClass('invisible')

    const stateTmplSrc = $('#state-template').html()
      , stateTemplate = Handlebars.compile( stateTmplSrc )
      , stateHtml = stateTemplate( JSON.parse( $('#state-data').html() ) )

    $states.append( stateHtml )

    $states.wrap( addWrapper )

    $states.addClass('selectpicker')
    $states.removeClass('invisible')



    /**
     *   Toggle focus/active state visual
     */
    const setActiveState = function( $group ){
        $inputgroups.removeClass('active')
        $group.addClass('active')
    }



    /**
     *  Calculate energy use and cost in the widget results box
     *  NB: special case of refrigerator where we account for compressor cycling (divide by 3)
     */
    const recalculate = function(){
        //console.log('Recalculating')
        const watts = $watts.val()
          , days = $days.val()
          , rate = $states.val()

        let energy = 0
          , cost   = 0
          , hours = $hours.val()
          , completed = false
          , $option

        $controls.each( ( idx, el ) => {
            completed = $(this).val() ? true : false
            return completed
        })

        if (completed) {

            $option = $appliances.find( 'option:selected' )

            if ( $option.text() === 'Refrigerator' ) {
                hours = Math.round( hours / 3 )
            }

            energy = watts * hours *  days / 1000 // convert watts to kilowatts
            cost = Math.round( energy * rate ) / 100 // convert rate from cents to dollars

            $energy.html(  energy + ' kWh')
            //console.log( 'cost:', cost)
            $cost.html( '$' + cost.toFixed(2) ) // make sure we have nice dollar figure
        }
    }

    /**
     *  Get utility rate data from EIA API
     */
    var getStateRate = function( statecode ){

        const series_id = apiConfig.series_id.replace( 'XX', statecode )

        return $.ajax({
            type: 'GET'
          , dataType: 'json'
          , url: apiConfig.url
          , data: {
                api_key: apiConfig.api_key
              , series_id: series_id
            }
        })

    }

    /**
     *  Restrict the type=number <inputs> to integers
     */
    $integers.on( 'change', event =>
        event.currentTarget.value = Math.round(event.currentTarget.value)
    )

    /**
     *  Helper function
     *  Update DOM option data attr for bootstrap-select
     */
    const updateSubtext = function( rate, index ){
        $states.find('option:eq('+index+')').data('subtext', '$0.'+rate+'/kWh');
        $states.selectpicker('refresh');
    }

    /**
     *  Update the utility rate info displayed in the bootstrap-select dropdown and button
     *  NB: the API returns values as cents per kilowatthour
     */
    $states.on( 'change', function( event ){

        const state = event.currentTarget
          , optnum = state.selectedIndex
          , option = state[ optnum ]
          , statecode = option.dataset.stateCode

        let jqxhr = new $.Deferred()
          , rate

        if ( !option.value ) {

            jqxhr = getStateRate( statecode )

            jqxhr.done( results => {
                rate = Math.round( results.series[0].data[0][1] ) // round our utility rate
                option.value = rate

                updateSubtext( rate, optnum )
                recalculate()
            })

            jqxhr.fail( () => alert('Error fetching rate data'))

        } else {
            rate = option.value
            updateSubtext( rate, optnum )
        }

    })


    /**
     *  When the user changes appliances, update the wattage to match the new appliance
     */
    $( '#appliances' ).on( 'change',  event => $watts.val( event.currentTarget.value ))



    /**
     *  When the user changes any control, recalculate the totals
     *  Delegate the binding for bootstrap-select
     */
    $( '#app' ).on( 'change', '.form-control', recalculate )


    /**
     *  When the user focuses on any control, highlight the whole parent group visually
     *  Delegate the binding for bootstrap-select
     */
    $( '#app' ).on( 'focus', '.form-control',  event => {
        const $group = $(event.currentTarget).parents('.input-group')
        setActiveState($group)
    })

})