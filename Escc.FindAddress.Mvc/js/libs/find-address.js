﻿if (typeof (jQuery) !== 'undefined') {
    "use strict";
    jQuery(function ($) {
        function SetTypeAddressAreaVisible(visible, context) {
            if (visible == true) $('div.type-address-area', context).show();
            else $('div.type-address-area', context).hide();
        }

        function SetSelectAddressAreaVisible(visible, context) {
            if (visible == true) $('div.select-address-area', context).show();
            else $('div.select-address-area', context).hide();
        }

        function SetTypeButtonAreaVisible(visible, context) {
            if (visible == true) $('span.manual-button-area', context).show();
            else $('span.manual-button-area', context).hide();
        }

        function SelectAddressErrorVisible(visible, context, message) {
            if (visible == true) $('p.select-address-error', context).show();
            else $('p.select-address-error', context).hide();

            $('p.select-address-error', context).text(message)
        }

        function HasTypeAddressData(context) {
            var paon = $('input.paon', context).val();
            var saon = $('input.saon', context).val();
            var locality = $('input.locality', context).val();
            var streetName = $('input.street', context).val();
            var town = $('input.town', context).val();
            var adminArea = $('input.administrative-area', context).val();

            var emptyTypeAddressData = paon == "" && saon == "" && locality == "" && streetName == "" && town == "" && adminArea == "";

            return !emptyTypeAddressData;
        }

        // Set up each find address control on the page. There may be multiple, so always use the 'findAddress' object as the context when selecting.
        $("fieldset.find-address-container").each(function () {
            var findAddress = $(this);

            SetTypeAddressAreaVisible(HasTypeAddressData(findAddress), findAddress);
            SetSelectAddressAreaVisible(false, findAddress);
            SetTypeButtonAreaVisible(true, findAddress);
            SelectAddressErrorVisible(false, findAddress, '');

            $('input.find-address', findAddress).on('click', function () {

                SetTypeAddressAreaVisible(false, findAddress);
                SetSelectAddressAreaVisible(false, findAddress);
                SetTypeButtonAreaVisible(true, findAddress);
                SelectAddressErrorVisible(false, findAddress, '');

                // Get the addresses that match the entered postcode using a web API
                $.ajax({
                    url: $("input.find-address", findAddress).data("button-url"),
                    type: 'GET',
                    data: { postcode: $('input.postcode', findAddress).val() },
                    dataType: 'json',
                    cache: false,
                    success: function (response) {
                        if (response != null && response.success) {
                            SetSelectAddressAreaVisible(true, findAddress);

                            if (response.data != null) {
                                $('select.possible-addresses', findAddress)
                                    .find('option')
                                    .remove();

                                $.each(response.data, function (i, obj) {
                                    $('select.possible-addresses', findAddress).append(
                                        $('<option></option>')
                                            .val(obj['Key'])
                                            .html(obj['Value']));
                                });
                            }
                        } else {
                            SelectAddressErrorVisible(true, findAddress, response.responseText);
                        }
                    },
                    error: function (response) {
                        SelectAddressErrorVisible(true, findAddress, "Error communicating with server");
                    }
                });
            });

            // Show the address fields if 'Type address' is clicked
            $('input.type-address', findAddress).on('click', function () {
                SetTypeAddressAreaVisible(true, findAddress);
                SetSelectAddressAreaVisible(false, findAddress);
                SetTypeButtonAreaVisible(false, findAddress);
                SelectAddressErrorVisible(false, findAddress, '');
            });

            // If 'Confirm address' is clicked get the full details of the address and enter it into the fields
            $('input.confirm-address', findAddress).on('click', function () {
                SelectAddressErrorVisible(false, findAddress, '');

                $.ajax({
                    url: $('input.confirm-address', findAddress).data("button-url"),
                    type: 'GET',
                    data: { postcode: $('input.postcode', findAddress).val(), uprn: $('select.possible-addresses option:selected', findAddress).val() },
                    dataType: 'json',
                    cache: false,
                    success: function (response) {
                        if (response != null && response.success) {
                            SetTypeAddressAreaVisible(true, findAddress);
                            SetSelectAddressAreaVisible(false, findAddress);
                            SetTypeButtonAreaVisible(false, findAddress);

                            if (response.data != null) {
                                var bs7666Address = response.data;
                                $('input[name$="Uprn"]', findAddress).val(bs7666Address.Uprn).change();
                                $('input[name$="Usrn"]', findAddress).val(bs7666Address.Usrn).change();
                                $('input[name$="Latitude"]', findAddress).val(bs7666Address.GeoCoordinate ? bs7666Address.GeoCoordinate.Latitude : null).change();
                                $('input[name$="Longitude"]', findAddress).val(bs7666Address.GeoCoordinate ? bs7666Address.GeoCoordinate.Longitude : null).change();
                                $('input.paon', findAddress).val(bs7666Address.Paon).change();
                                $('input.saon', findAddress).val(bs7666Address.Saon).change();
                                $('input.locality', findAddress).val(bs7666Address.Locality).change();
                                $('input.street', findAddress).val(bs7666Address.StreetName).change();
                                $('input.town', findAddress).val(bs7666Address.Town).change();
                                $('input.administrative-area', findAddress).val(bs7666Address.AdministrativeArea).change();
                                $('input.postcode', findAddress).val(bs7666Address.Postcode).change();
                            }
                        } else {
                            SelectAddressErrorVisible(true, findAddress, response.responseText);
                        }
                    },
                    error: function (response) {
                        SelectAddressErrorVisible(true, findAddress, "Error communicating with server");
                    }
                });
            });
        });
    });
}