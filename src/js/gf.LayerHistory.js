;
(function ($, window, document, undefined) {
    //'use strict';
    var pluginName = 'gfLayerHistory'; //Plugin名稱
    var gfLayerHistory;

    if($.cachedScript == undefined){
        $.cachedScript = function (url, options) {
            // Allow user to set any option except for dataType, cache, and url
            options = $.extend(options || {}, {
                dataType: "script",
                cache: true,
                url: url
            });
            // Use $.ajax() since it is more flexible than $.getScript
            // Return the jqXHR object so we can chain callbacks
            return $.ajax(options);
        };
    }

    //Load dependencies first
    $.cachedScript('node_modules/jquery.nicescroll/dist/jquery.nicescroll.min.js').done(function(){
        //建構式
        gfLayerHistory = function (element, options) {

            this.target = element; //html container
            //this.prefix = pluginName + "_" + this.target.attr('id'); //prefix，for identity
            this.opt = {};
            //o._init(options);
            var initResult = this._init(options); //初始化
            if (initResult) {
                //初始化成功之後的動作
                this._style();
                this._event();
                this._subscribeEvents();
            }
        };

        //預設參數
        gfLayerHistory.defaults = {
            arrData: [],            
            activeItem: [],
            css: {
                'width': '300px',
                'height': '300px',
                'background-color': '#e3f0db',
                'overflow-y': 'auto',
                'overflow-x': 'hidden',
                'display': 'inline-block'
            },

            identityField: 'id',//識別欄位
            nameField: 'name',//名稱欄位
            parentField: 'parent_id',//父層識別欄位
            isparentField: 'isparent',//是否為父層欄位
            iconField: 'type',//圖示類型欄位
            urlField: 'kmlurl',
            layeridField: 'layerid2d',

            iconType: {
                'folder': {
                    'close': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzkvMTETEwwTAAAFKElEQVRYhe2XzY4kRxWFv3vjJ7O6zYwR8sCIhVcWrwE7e8HW3voFbL8KNi/ACmFWXmEvkXiB2SJ5wwYYzVhT3dNV+RMRN1hEZnS35B9sWcyGkFqdWRkVceLcc86tlForr3LoK939/wAA2S8++fTzXwN/AN78hrn/AN7/8L13/vp9Nvgujfk715/98vHjhw8e/AQAKwYiiDSMV9dXb/7r308/A17/PgC+a8gnn35eAV5/+IBHb7zBi5sZEUFVMTNqrdRa+dmDS54+e8bxePxBG33w7tvydZ97gF+99RbUynnNnbKcMwDOOQBO88ovHj3i8c8fsbNazRBVzArOOazc3sttdfn7l19+I7Begq9ennHO4ZzrIPZrMyOL8OJmQkTIOeO9p5TSmboLttaKiFBK4aevjd/KjAcQEZ4//ee3Tvyh49n2//d//uJr1XhXhLz/29/ANm0XX1exgMqta0WkPRMQ2mnhDgvbQvsz51yfo6rM68ofv/jbk3sArm4mrk4zh8MBEeF8PnM4HFjXlWEYWJall2Acxw4i50zOGRHp83PODMNwb/MQQgMpcLx+CXCl0MQE4LxnPBw4TxPzslCBaZ4JMbKsK+ocVivj4UAuhWJGBXIpVCDEyJoSPgTGw4E1JRBBnaMC52mCDXSxCnBUANFGbcqFNWUQpVhFnSfEgWVNVIRiFattXi4GopynGaswHi6Y5oVilVyMlAvOB9aUKVbxIRKHkWVNOKe8eHkD8KQB2BxTqR3tMI4gQi6FXAop535vtYIIKWeGcURUOU8Th4sL1Ll+6v07xYxlXdtGInjvu7bu9YLgIyA455mmmZwLqo5xPDAMI6UYIURElBAiKWUaFkXVcTqdm+xESSnjnMc5TylGzoVlWTGr1ArH68aAB7o6ixXWtGJmxBgxM0SFZV2otRJjvM2FNeODZ00r3ntyyhwuDtRamZcZVaVYuVW+0ybYklnTSmqfH+8x0KhVRB3FKvOy9ppWBKtgFdT5fp9yoVhF1DHNC1bp31/WBKI4H7BKXwvRprUdwO5dEcV5z5oSdXPFruRd6SnnezrYHbHXfp8fYkSdI5fCvCzkUkAE55vzr29OfPDu202EO01tceuIK4IPER9iP60630+zKzzEoTtA1FERbk5nEMWHyDAeurPa+rfx4/e06nYUw2olrStx8/We/bkU4hYqcQsZUeW0Bda0+TzG2J+nde3JOY4jWo3nL44AT7oL9tgEmsC2pFNVvPcMw4CIEELoqTfPM9C6Zq2VlBLOud6cVJWUEnuJY4zknHGuOQS46gzcDuE8zYQQKNYWNTPGcWReVlS1dzoQljXhvScOreNVawEErUv6EHHOsSytPGbG5RC3ORw7A7sIEcGH0AW1C2+PXOc9znvUuT5nD6RpnllTIsSIqFKs1XqaZ+IwdOF6J7w8T70E93KgUVpIKW+UtxO0xjIyTROqinOOlFYuLi46cy2cAtM097VOpzMxRuZ5QdX1Eu69pzMge5sVBZEew7t9Us49auuWF7v9dgvucVvMugVDjFitiGpvVCLK9el8nwGz2yT0IWC1dpr3Da1Wbk6n1lrNyHNLu6YXI25CTSlRzChm935T7iVFZRfhcQfw8bPnzz/aqXw4NiU3xTpqBb2Mt83jzrOcC861+xAiOSfC5SV7WdvPMkNVtuuAiLZWnvNV2xH4+E9/+Z2IfMT/cHz43ju+1lpks5UDIvAacLn9BX68N6cKZGACboBrYLkL4Efa579Ec+dtSV716/l/AEMVgc68DbpnAAAAAElFTkSuQmCC',
                    'open': 'data:image/png;base64,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',
                },
                '向量':{
                    'close': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzkvMTETEwwTAAABpUlEQVRYhe2XTUsCQRjHf5Ob4Fshhl6jKLvUHjuV3Tx27OipxI8hfYgi6BB9g+6Bq178AIIvSZfEhAQNoYRyO7gry7Zi5rp68A8Pywyz8/z2+c8OM0JVVXQJIcgouTiQAk6ZXnfA1UnsqABgzDXMaexUsvmkJEnX0egOG6HQVJkr1RrrawFK5coQwgpAMrVTsryP3+ezpJ1UkUgYIFEqV8goOYCCecyKqS3blRwGJY9EwuxFdxNASsnmD8cBDF60IfR5+mMgzBbo6BN96Uhp8+gQaHZgsMKyArNQv98fQhj7LStgVwGeas9jx1hbwPQE21ubv/pcLheNRmM8gE0F+JNGLMJ5AzhIsLRgRAXmbIGTFXBsJxylpQUL+hsuLXAu/4xPRP8FcLICi7kROWnBihACPQCl3eng9XpsOZobw+v10O50ABQjgAQI7eluNl/vi0UpZsfVzKy3VotyuUqv17sRQghVu/0IwAW4gQAQSKcv4weyfBYMBo/tBOh2u4/1+stt8uL8AfhUVfXbDOAHfFqsYt8CVYEv4APoAu9AzwjgqMz3zh+JJ8M3gBMOmgAAAABJRU5ErkJggg==',
                    'open': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzkvMTETEwwTAAAEE0lEQVRYhd2XX2xTVRzHP7f39ra9bQUCYYoGCGQUha0DE4UEGOoDRklAY5Ro4l6EZSYEHiQ++AIxPmg08cU/EI0hGjUmBkGNJgSzbiOTjAADJ+s2BuyvQ0YotL339t57rg/tmlK7P3UVE7/NeTgn93d+n35/55x7j+S6LhOSJInmWOsWoAnYxux1GPhoc/3GUwCFufI5CwdjLW2NiqJ8HIlUs2D+/Fll7um9xJx7wnTHe/IQpQCUon5TNFpDKBgsSVuuqqoWAjR0x3tojrUCnCp+xlPUj1YqOWQtr6payMrIigagKdbS9uh0ANnACrSJecQ0EMUlmEAv659Oqtw8ExDkykFBKUo68G9ICJGHKBwv6UClDOi7dHnaZ0qXgNkTLF+29G9jsiwzOjo6PUCFDJiRJlmE/zXAXST4f5Ug3tdP+5nzXBkaRZKyO9x1BUsfuI/1a2tZ/eCKmQG4/4DgyI/H6ezuQ5YVvD4/sicL4AjBwMg1Lg/+zJrefhbODd0RV/ogKvPcPfLDcc5d7EWWFVSfn4CmoYXCaKEwgUAAWVFwHEFHZxdnu3pmAFCG4n39nL3Yk0vuwxcI4PcHUH1+vKoPj0fGNA3StxOYhsHgtXFefvW1x6YEcMv4new4h8fjQVFVvKoPr9eLR1ZAkrBti+StBGGfl3f2v07tQ9Xcup1EUX17pnagDPsvDw5nF5xwyWQMLMtCODYZwyAxfh1VEuxpbCDg9/Pis9vwelW8qpr/2qrINnQcgWkkCGl+bqTShEJh9HQKLw57d+8kqGnohsmHX3yLLCs4jp2PnWQNzNwC13URjk3dqgj79+0msmQRA1f7sc00+wqSH/rqO8au38gWruBtN+tzQAiBR5Z5buuTADy//SkSiZvsangJTQsAcOxEGyN/3sCyLBzHRggxtQPl7MJlixeh6wbvHTyMrpsENY29Ta/kk3/9/XHO/NaNZRpkTAPbsrBM8+iUALjujNv6h+tIpVJcGRzi3YOfoetmfpovj/5Ex/nfMQ0dQ0+TMQ0c28bQ0+9XzIFI9XI2PLIG28pw5eoQb3/wCbpucPibo7SfPo+p6xjpNBnDwLYyVC+5HyuTaZ7INcnbsDzteGYrAC3tpxkYGmH3G28h5Y5iVwiEEAjH4YmN61h87wI6znTmYyv2Ubpj+9PUrVrJL62/ciHei4SUnQqXmkg1j29cx9roamItbXfESYWd5lhrczRaUz93zhxSab1siKkU1ALcTCTo7LwQq9+0YfPEuJKDUAB1bOyPz7u6lPpKXM2KdX18nHi8F9M0D0mSJLm5w0ACZEAFwkD4wIE3t9RGoy/MmzdvUyUBksnkieHhoU8bd+08Bhiu6zrFACEgmGteKndncAEb0IEkcAswCwHuqorvnX8BQwcw2KDp4OkAAAAASUVORK5CYII=',
                },
                'kmlurl':{
                    'close': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzkvMTETEwwTAAABpUlEQVRYhe2XTUsCQRjHf5Ob4Fshhl6jKLvUHjuV3Tx27OipxI8hfYgi6BB9g+6Bq178AIIvSZfEhAQNoYRyO7gry7Zi5rp68A8Pywyz8/z2+c8OM0JVVXQJIcgouTiQAk6ZXnfA1UnsqABgzDXMaexUsvmkJEnX0egOG6HQVJkr1RrrawFK5coQwgpAMrVTsryP3+ezpJ1UkUgYIFEqV8goOYCCecyKqS3blRwGJY9EwuxFdxNASsnmD8cBDF60IfR5+mMgzBbo6BN96Uhp8+gQaHZgsMKyArNQv98fQhj7LStgVwGeas9jx1hbwPQE21ubv/pcLheNRmM8gE0F+JNGLMJ5AzhIsLRgRAXmbIGTFXBsJxylpQUL+hsuLXAu/4xPRP8FcLICi7kROWnBihACPQCl3eng9XpsOZobw+v10O50ABQjgAQI7eluNl/vi0UpZsfVzKy3VotyuUqv17sRQghVu/0IwAW4gQAQSKcv4weyfBYMBo/tBOh2u4/1+stt8uL8AfhUVfXbDOAHfFqsYt8CVYEv4APoAu9AzwjgqMz3zh+JJ8M3gBMOmgAAAABJRU5ErkJggg==',
                    'open': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzkvMTETEwwTAAAEE0lEQVRYhd2XX2xTVRzHP7f39ra9bQUCYYoGCGQUha0DE4UEGOoDRklAY5Ro4l6EZSYEHiQ++AIxPmg08cU/EI0hGjUmBkGNJgSzbiOTjAADJ+s2BuyvQ0YotL339t57rg/tmlK7P3UVE7/NeTgn93d+n35/55x7j+S6LhOSJInmWOsWoAnYxux1GPhoc/3GUwCFufI5CwdjLW2NiqJ8HIlUs2D+/Fll7um9xJx7wnTHe/IQpQCUon5TNFpDKBgsSVuuqqoWAjR0x3tojrUCnCp+xlPUj1YqOWQtr6payMrIigagKdbS9uh0ANnACrSJecQ0EMUlmEAv659Oqtw8ExDkykFBKUo68G9ICJGHKBwv6UClDOi7dHnaZ0qXgNkTLF+29G9jsiwzOjo6PUCFDJiRJlmE/zXAXST4f5Ug3tdP+5nzXBkaRZKyO9x1BUsfuI/1a2tZ/eCKmQG4/4DgyI/H6ezuQ5YVvD4/sicL4AjBwMg1Lg/+zJrefhbODd0RV/ogKvPcPfLDcc5d7EWWFVSfn4CmoYXCaKEwgUAAWVFwHEFHZxdnu3pmAFCG4n39nL3Yk0vuwxcI4PcHUH1+vKoPj0fGNA3StxOYhsHgtXFefvW1x6YEcMv4new4h8fjQVFVvKoPr9eLR1ZAkrBti+StBGGfl3f2v07tQ9Xcup1EUX17pnagDPsvDw5nF5xwyWQMLMtCODYZwyAxfh1VEuxpbCDg9/Pis9vwelW8qpr/2qrINnQcgWkkCGl+bqTShEJh9HQKLw57d+8kqGnohsmHX3yLLCs4jp2PnWQNzNwC13URjk3dqgj79+0msmQRA1f7sc00+wqSH/rqO8au38gWruBtN+tzQAiBR5Z5buuTADy//SkSiZvsangJTQsAcOxEGyN/3sCyLBzHRggxtQPl7MJlixeh6wbvHTyMrpsENY29Ta/kk3/9/XHO/NaNZRpkTAPbsrBM8+iUALjujNv6h+tIpVJcGRzi3YOfoetmfpovj/5Ex/nfMQ0dQ0+TMQ0c28bQ0+9XzIFI9XI2PLIG28pw5eoQb3/wCbpucPibo7SfPo+p6xjpNBnDwLYyVC+5HyuTaZ7INcnbsDzteGYrAC3tpxkYGmH3G28h5Y5iVwiEEAjH4YmN61h87wI6znTmYyv2Ubpj+9PUrVrJL62/ciHei4SUnQqXmkg1j29cx9roamItbXfESYWd5lhrczRaUz93zhxSab1siKkU1ALcTCTo7LwQq9+0YfPEuJKDUAB1bOyPz7u6lPpKXM2KdX18nHi8F9M0D0mSJLm5w0ACZEAFwkD4wIE3t9RGoy/MmzdvUyUBksnkieHhoU8bd+08Bhiu6zrFACEgmGteKndncAEb0IEkcAswCwHuqorvnX8BQwcw2KDp4OkAAAAASUVORK5CYII=',
                },
                'wms':{
                    'close': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzkvMTETEwwTAAABpUlEQVRYhe2XTUsCQRjHf5Ob4Fshhl6jKLvUHjuV3Tx27OipxI8hfYgi6BB9g+6Bq178AIIvSZfEhAQNoYRyO7gry7Zi5rp68A8Pywyz8/z2+c8OM0JVVXQJIcgouTiQAk6ZXnfA1UnsqABgzDXMaexUsvmkJEnX0egOG6HQVJkr1RrrawFK5coQwgpAMrVTsryP3+ezpJ1UkUgYIFEqV8goOYCCecyKqS3blRwGJY9EwuxFdxNASsnmD8cBDF60IfR5+mMgzBbo6BN96Uhp8+gQaHZgsMKyArNQv98fQhj7LStgVwGeas9jx1hbwPQE21ubv/pcLheNRmM8gE0F+JNGLMJ5AzhIsLRgRAXmbIGTFXBsJxylpQUL+hsuLXAu/4xPRP8FcLICi7kROWnBihACPQCl3eng9XpsOZobw+v10O50ABQjgAQI7eluNl/vi0UpZsfVzKy3VotyuUqv17sRQghVu/0IwAW4gQAQSKcv4weyfBYMBo/tBOh2u4/1+stt8uL8AfhUVfXbDOAHfFqsYt8CVYEv4APoAu9AzwjgqMz3zh+JJ8M3gBMOmgAAAABJRU5ErkJggg==',
                    'open': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzkvMTETEwwTAAAEE0lEQVRYhd2XX2xTVRzHP7f39ra9bQUCYYoGCGQUha0DE4UEGOoDRklAY5Ro4l6EZSYEHiQ++AIxPmg08cU/EI0hGjUmBkGNJgSzbiOTjAADJ+s2BuyvQ0YotL339t57rg/tmlK7P3UVE7/NeTgn93d+n35/55x7j+S6LhOSJInmWOsWoAnYxux1GPhoc/3GUwCFufI5CwdjLW2NiqJ8HIlUs2D+/Fll7um9xJx7wnTHe/IQpQCUon5TNFpDKBgsSVuuqqoWAjR0x3tojrUCnCp+xlPUj1YqOWQtr6payMrIigagKdbS9uh0ANnACrSJecQ0EMUlmEAv659Oqtw8ExDkykFBKUo68G9ICJGHKBwv6UClDOi7dHnaZ0qXgNkTLF+29G9jsiwzOjo6PUCFDJiRJlmE/zXAXST4f5Ug3tdP+5nzXBkaRZKyO9x1BUsfuI/1a2tZ/eCKmQG4/4DgyI/H6ezuQ5YVvD4/sicL4AjBwMg1Lg/+zJrefhbODd0RV/ogKvPcPfLDcc5d7EWWFVSfn4CmoYXCaKEwgUAAWVFwHEFHZxdnu3pmAFCG4n39nL3Yk0vuwxcI4PcHUH1+vKoPj0fGNA3StxOYhsHgtXFefvW1x6YEcMv4new4h8fjQVFVvKoPr9eLR1ZAkrBti+StBGGfl3f2v07tQ9Xcup1EUX17pnagDPsvDw5nF5xwyWQMLMtCODYZwyAxfh1VEuxpbCDg9/Pis9vwelW8qpr/2qrINnQcgWkkCGl+bqTShEJh9HQKLw57d+8kqGnohsmHX3yLLCs4jp2PnWQNzNwC13URjk3dqgj79+0msmQRA1f7sc00+wqSH/rqO8au38gWruBtN+tzQAiBR5Z5buuTADy//SkSiZvsangJTQsAcOxEGyN/3sCyLBzHRggxtQPl7MJlixeh6wbvHTyMrpsENY29Ta/kk3/9/XHO/NaNZRpkTAPbsrBM8+iUALjujNv6h+tIpVJcGRzi3YOfoetmfpovj/5Ex/nfMQ0dQ0+TMQ0c28bQ0+9XzIFI9XI2PLIG28pw5eoQb3/wCbpucPibo7SfPo+p6xjpNBnDwLYyVC+5HyuTaZ7INcnbsDzteGYrAC3tpxkYGmH3G28h5Y5iVwiEEAjH4YmN61h87wI6znTmYyv2Ubpj+9PUrVrJL62/ciHei4SUnQqXmkg1j29cx9roamItbXfESYWd5lhrczRaUz93zhxSab1siKkU1ALcTCTo7LwQq9+0YfPEuJKDUAB1bOyPz7u6lPpKXM2KdX18nHi8F9M0D0mSJLm5w0ACZEAFwkD4wIE3t9RGoy/MmzdvUyUBksnkieHhoU8bd+08Bhiu6zrFACEgmGteKndncAEb0IEkcAswCwHuqorvnX8BQwcw2KDp4OkAAAAASUVORK5CYII=',
                }
            },
            scrollColor: '#527100',

            onClick: undefined,
            onSelect: undefined,
            onUnSelect: undefined,
            onInitComplete: undefined,
            onDragStart: undefined,
            onDragEnd: undefined
        };

        //方法
        gfLayerHistory.prototype = {
            //私有方法
            _init: function (_options) {
                //合併自訂參數與預設參數
                try {
                    this.opt = $.extend(true, {}, gfLayerHistory.defaults, _options);
                    return true;
                } catch (ex) {
                    return false;
                }
            },
            _style: function () {
                var o = this;
                o.target.css(o.opt.css);
                
                var div = $('<div/>', {
                    class: "gfLayerHistory-Placeholder",
                    text: "點選過的圖層會出現在此"
                });
                o.target.append(div);
                
                o.target.niceScroll({ cursorcolor: o.opt.scrollColor});
            },
            _event: function () {
                var o = this;
                
                o.target
                    .on('click', '.gfTreeItem', function(e){                        
                        var et = $(this);
                        var eid = et.data().id;
                        var lvl = et.data().lvl;
                        var st = et.data().st;
                        var path = et.data().path;
                        var tp = et.data().type;
                        var pattern = new RegExp('^' + path + "_");
                        
                        
                            if(st == "close")
                            {
                                $(this).data("st", "open");
                                $(this).attr("data-st", "open");
                                $(this).children('.gfTreeContent-Icon').attr('src', o.opt.iconType[tp]["open"])

                                if(tp == "folder")
                                {
                                    o.opt.arrData
                                        .filter(function(x){ return x[o.opt.parentField] == eid; })
                                        .sort(function(a, b){ return a[o.opt.identityField] * 1 < b[o.opt.identityField] * 1; })
                                        .forEach(function(ele){
                                            var div = $('<div/>', {
                                                "class": "gfTreeItem",
                                                "data-id": ele[o.opt.identityField],
                                                "data-type": ele[o.opt.iconField],
                                                "data-kmlurl": ele[o.opt.urlField],
                                                "data-layerid2d": ele[o.opt.layeridField],
                                                "data-parentid": ele[o.opt.parentField],
                                                "data-lvl": lvl + 1,
                                                "data-st": "close",
                                                "data-path": path + "_" + ele[o.opt.identityField]
                                            });
                                            div.css('padding-left', (lvl + 1) * 15 + 10 + "px");
                                            
                                            if(o.opt.activeItem.indexOf(ele[o.opt.identityField] * 1) >= 0){
                                                st = "open";
                                                div.data("st", st);
                                                div.attr("data-st", st);
                                            }
                                            var icon = $('<img/>', {
                                                "class": "gfTreeContent-Icon",
                                                "src": o.opt.iconType[ele[o.opt.iconField]][st]
                                            });
                                            div.append(icon);
                                            var span = $('<span/>',{
                                                "class": "gfTreeContent-Text",
                                                "text": ele[o.opt.nameField]
                                            });
                                            div.append(span);

                                            et.after(div);
                                        });
                                }
                                else{                       
                                    o.opt.activeItem.push($(this).data().id);
                                    var r = $(this).data();
                                    r.selected = true;
                                    o.target.trigger('onClick', r);
                                }
                            }
                            else{
                                $(this).data("st", "close");
                                $(this).attr("data-st", "close");
                                $(this).children('.gfTreeContent-Icon').attr('src', o.opt.iconType[tp]["close"])

                                if(tp == "folder")
                                {
                                    et.nextAll(".gfTreeItem").each(function(){
                                        if(pattern.test($(this).data().path)){
                                            $(this).remove();
                                        }
                                    });
                                }
                                else{
                                    var r = $(this).data();
                                    r.selected = false;
                                    o.target.trigger('onClick', r);
                                    o.opt.activeItem.splice(o.opt.activeItem.indexOf($(this).data().id * 1), 1);
                                }
                            }
                        

                        o.target.getNiceScroll().resize();
                        
                    });
                    
            },
            _add: function (_items) {
                var o = this;

                _items.forEach(function(_item){
                    if(o.opt.arrData.length > 0){
                        var ch = o.opt.arrData.map(function(ele){ return ele[o.opt.identityField] * 1; }).indexOf(_item[o.opt.identityField] * 1);
                        if(ch < 0){                            
                            o._addNewItem(_item);    
                        }
                        else{
                            o._removeExistItem(ch);
                        }
                    }
                    else{                        
                        o._addNewItem(_item);
                    }
                });
                
                o.target
                    .find('.gfLayerHistory-Placeholder')
                        .remove()
                        .end();                    
            },

            _addNewItem: function(_item){
                var o = this;
                o.opt.arrData.push(_item);

                var div = $('<div/>', {
                    "class": "gfTreeItem",
                    
                    "data-id": _item[o.opt.identityField],
                    "data-type": _item[o.opt.iconField],
                    "data-kmlurl": _item[o.opt.urlField],
                    "data-layerid2d": _item[o.opt.layeridField],
                    "data-parentid": _item[o.opt.parentField],
                    //"data-lvl": 0,
                    "data-st": "open",
                    //"data-path": _item[o.opt.identityField]
                });
                var icon = $('<img/>', {
                    "class": "gfTreeContent-Icon",
                    "src": o.opt.iconType[_item[o.opt.iconField]]["open"]
                });
                div.append(icon);
                var span = $('<span/>',{
                    "class": "gfTreeContent-Text",
                    "text": _item[o.opt.nameField]
                });
                div.append(span);

                o.target.prepend(div);
                o.target.getNiceScroll().resize();
            },

            _removeExistItem: function(_ch){
                var o = this;
                var id = o.opt.arrData[_ch][o.opt.identityField];
                o.opt.arrData.splice(_ch, 1);
                
                o.target
                    .find('.gfTreeItem[data-id=' + id + ']')
                    .remove();
            },

            //註冊事件接口
            _subscribeEvents: function () {
                //先解除所有事件接口
                this.target.off('onClick');

                //綁定點擊事件接口
                if (typeof (this.opt.onClick) === 'function') {
                    this.target.on('onClick', this.opt.onClick);
                }
            }



        };
    });

    //實例化，揭露方法，回傳
    $.fn[pluginName] = function (options, args) {
        var gflayerhistory;
        this.each(function () {
            gflayerhistory = new gfLayerHistory($(this), options);
        });
        this.add = function(_items){
            return gflayerhistory._add(_items);
        }
        
        return this;
    };
})(jQuery, window, document);