$(document).ready(function () {

    $('.nav-trigger').on('click', function(e) {
        e.preventDefault();

        $(this).toggleClass('active');

        $('.mobile-menu').toggleClass('active');
        $('.page-wrapper').toggleClass('active');
    });

    $('.js-mobile-search-trigger').click(function (e) {

        e.preventDefault();

        $('.search-form').toggleClass('active');
    });


    // если мы находимся на внутренней странице - поставить розовую линию на активный пункт меню
    (function() {

        var activeMenuItem,
            mainNav = $('.main-nav'),
            mainNavItems = mainNav.find('a'),
            line = $('.main-nav').find('.line');

        positionLine();

        function positionLine() {

            activeMenuItem =  mainNav.find('span');

            if (activeMenuItem.length) {


                line.css({
                    transform: 'translateX(' + activeMenuItem.position().left + 'px',
                    width: activeMenuItem.outerWidth(),
                    opacity: 1
                })
            } else {
                return;
            }
        }

        mainNavItems.hover(function () {

            line.css({
                transform: 'translateX(' + $(this).position().left + 'px)',
                width: $(this).outerWidth(),
                opacity: '1'
            });

        }, function () {

            if (mainNav.find('span').length) {

                var activeItem = mainNav.find('span');

                line.css({
                    transform: 'translateX(' + activeItem.position().left + 'px)',
                    width: activeItem.outerWidth()
                });

            } else {
                line.css('opacity', 0)
            }

        });

    })();

    if ($(window).width() < 880) {

        $('.items-slider .items-row').slick({
            slidesToShow: 1,
            infinite: true,
            pauseOnHover: false,
            prevArrow: $('.items-slider .arrow-left'),
            nextArrow: $('.items-slider .arrow-right'),
            mobileFirst: true
        });

    }


    if ($(window).width() > 880) {

        $('.promo-slider .wrapper').slick({
            slidesToShow: 1,
            infinite: true,
            autoplay: true,
            dots: true,
            pauseOnHover: false,
            prevArrow: $('.promo-slider .arrow-left'),
            nextArrow: $('.promo-slider .arrow-right')
        });


    }

    $('.filter-hidden').each(function () {
        console.log($(this).height());

        var maxHeight = 0;
        var $filter = $(this);



        $filter.children().each(function () {
            maxHeight += $(this).outerHeight();
        });

        $filter.attr('data-fullheight', maxHeight);
    });

    // триггер для каталога
    $('.filter-trigger').click(function (e) {

        e.preventDefault();

        $(this).toggleClass('active').toggleClass('btn-blue');

        if ($(this).hasClass('active')) {
            $(this).text('Скрыть фильтр');
        } else {
            $(this).text('Открыть фильтр');
        }

        $('.filter-form').slideToggle();
    });

    $("#range").ionRangeSlider({
        type: "double",
        grid: false,
        min: 0,
        max: 40000,
        from: 75,
        to: 25000,
        step: 50,
        hide_min_max: true,
        hide_from_to: true,
        onStart: function(data) {
            $('.price-range-min').val(data.from);
            $('.price-range-max').val(data.to);
        },
        onChange: function(data) {
            $('.price-range-min').val(data.from);
            $('.price-range-max').val(data.to);
        }
    });

    $('.custom-select').selectmenu();
    
    $('.show-hidden').click(function (e) {
        e.preventDefault();

        var $hiddenFilter = $(this).prev();

        $(this).toggleClass('active');

        if ($(this).hasClass('active')) {
            $(this).html('- <span>скрыть</span>');

            $hiddenFilter.animate({
                'height': $hiddenFilter.data('fullheight')
            });

        } else {
            $(this).html('+ <span>развернуть</span>');

            $hiddenFilter.animate({
                'height': '170px'
            });

        }
    });

    $('.js-blur-trigger').hover(function () {

        $(this).parent().parent().find('.js-blur-bg').addClass('blurred');

    }, function () {

        $(this).parent().parent().find('.js-blur-bg').removeClass('blurred');

    });

    $('.fancybox-modal').fancybox({
        closeBtn: false,
        fitToView: false,
        scrolling: 'visible',
        padding: 0
    });

    $('.fancybox').fancybox();

    // WOW.JS

    new WOW({
        mobile: false
    }).init();


    // стрелка "Вверх" на мобильных
    $('.js-arrow-up').on('click', function(e) {
        e.preventDefault();

        $('body, html').animate({
            'scrollTop': 0
        });

    });

    // слайдер на странице товара

    $('.full-item-slider').slick({
        slidesToShow: 1,
        infinite: false,
        vertical: true,
        verticalSwiping: true,
        asNavFor: $('.item-thumbnails .wrapper')
    });

    $('.item-thumbnails .wrapper').slick({
        slidesToShow: 5,
        infinite: false,
        vertical: true,
        verticalSwiping: true,
        focusOnSelect: true,
        asNavFor: $('.full-item-slider'),
        mobileFirst: true,
        responsive: [
            {
                breakpoint: 880,
                settings: {
                    slidesToShow: 6
                }
            }
        ]
    });

    $('.js-delivery').change(function () {
        if ($(this).hasClass('js-delivery-shop')) {
            $('.address-group').fadeOut();
        } else {
            $('.address-group').fadeIn();
        }
    });
    // PINNER.JS

    var pinner = new Pinner('.order-overall-body', {
        minWindowWidth: 880,
        responsive: true,
        context: 'window'
    });
    // Показываем стрелку Вверх только на мобильных
    if ($(window).width() < 880) {

        // Изначальное состояние стрелки
        var arrowUpIsShown = null;

        // Событие с коллбеком onScroll
        $(window).on('scroll', onScroll);

        function onScroll(e) {

            // Если скролл больше 200 пикселей - показываем стрелку
            if ($(window).scrollTop() > 200 && !arrowUpIsShown) {

                arrowUpIsShown = true;

                $('.js-arrow-up').fadeIn();

            } else if ($(window).scrollTop() < 200 && arrowUpIsShown) { // Иначе - скрываем

                arrowUpIsShown = false;

                $('.js-arrow-up').fadeOut();
            }
        }
    }

});