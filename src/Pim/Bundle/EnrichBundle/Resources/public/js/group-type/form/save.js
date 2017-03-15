'use strict';

/**
 * Save extension for group type
 *
 * @author    Tamara Robichet <tamara.robichet@akeneo.com>
 * @copyright 2017 Akeneo SAS (http://www.akeneo.com)
 * @license   http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
define(
    [
        'jquery',
        'underscore',
        'oro/translator',
        'pim/form/common/save',
        'oro/messenger',
        'pim/saver/group-type',
        'pim/field-manager',
        'pim/i18n',
        'pim/user-context'
    ],
    function (
        $,
        _,
        __,
        BaseSave,
        messenger,
        GroupTypeSaver,
        FieldManager,
        i18n,
        UserContext
    ) {
        return BaseSave.extend({
            updateSuccessMessage: __('pim_enrich.entity.group_type.info.update_successful'),
            updateFailureMessage: __('pim_enrich.entity.group_type.info.update_failed'),
            notReadyMessageLabel: 'pim_enrich.entity.group_type.info.field_not_ready',

            getFieldLabels: function(fields, catalogLocale) {
              _.map(fields, function (field) {
                  return i18n.getLabel(
                      field.attribute.label,
                      catalogLocale,
                      field.attribute.code
                  );
              });
            },

            showFlashMessage: function(message, labels) {
              messenger.notificationFlashMessage(
                  'error',
                  __(
                      message,
                      {'fields': labels.join(', ')}
                  )
              );
            },

            /**
             * {@inheritdoc}
             */
            save: function () {
                var entity = $.extend(true, {}, this.getFormData());
                delete entity.meta;

                var notReadyFields = FieldManager.getNotReadyFields();

                if (0 < notReadyFields.length) {
                    var catalogLocale = UserContext.get('catalogLocale')
                    var fieldLabels = this.getFieldLabels(notReadyFields, catalogLocale)
                    return this.showFlashMessage(this.notReadyMessageLabel, fieldLabels)
                }

                this.showLoadingMask();
                this.getRoot().trigger('pim_enrich:form:entity:pre_save');

                return GroupTypeSaver
                    .save(entity.code, entity)
                    .then(function (data) {
                        this.postSave();
                        this.setData(data);
                        this.getRoot().trigger('pim_enrich:form:entity:post_fetch', data);
                    }.bind(this))
                    .fail(this.fail.bind(this))
                    .always(this.hideLoadingMask.bind(this));
            }
        });
    }
);
