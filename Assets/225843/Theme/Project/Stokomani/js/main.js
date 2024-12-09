var heightMinMenu;
var hauteurEnfant;
jQuery(document).on("mobileinit", function () {
  jQuery.mobile.autoInitializePage = false;
});
$(document).ready(function () {
  (function initJsBloc() {
    $("div[zto-insta]").removeClass("hide-zento");
    $(".wishlist-alert").removeClass("hide-zento");
    $('div[data-name="Rbs_Storelocator_Search"]').removeClass("hide-zento");
    $(".activeClickAndCollect").removeClass("activeClickAndCollect");
    $("#header").removeClass("hide-zento");
    $("#content").removeClass("hide-zento");
    $("#footer").removeClass("hide-zento");
    $(".autoplayActualiter").removeClass("hide-zento");
    $("#mainMenu").removeClass("hide-zento");
    $(".contexte-actualite-slider-zento").removeClass("hide-zento");
    $("#mailing-list-zento").removeClass("hide-zento");
    $(".zto-inscription-gestion").removeClass("hide-zento");
    $(".link-ancre").removeClass("hide-ancre");
    $(".hover-carousel-control").hover(
      function () {
        $(this).attr("src", function (index, attr) {
          return attr.replace(".svg", "_green.svg");
        });
      },
      function () {
        $(this).attr("src", function (index, attr) {
          return attr.replace("_green.svg", ".svg");
        });
      },
    );
  })();
  $(".media-visuals .media-visuals-main a").mouseover(function () {
    $(".visual-zento-product-detail").css("overflow", "visible");
  });
  $(".media-visuals .media-visuals-main a").mouseleave(function () {
    $(".visual-zento-product-detail").css("overflow", "hidden");
  });
  $('div[data-ng-controller="RbsElasticsearchResultList"]').addClass(
    "active-block-js",
  );
  $(".autoplay").slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
    prevArrow: "<button type='button' class='slick-prev pull-left'></button>",
    nextArrow: "<button type='button' class='slick-next pull-right'></button>",
    responsive: [
      { breakpoint: 990, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: false,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
      {
        breakpoint: 560,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
    ],
  });
  $(".autoplayActualites").slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: "<button type='button' class='slick-prev pull-left'></button>",
    nextArrow: "<button type='button' class='slick-next pull-right'></button>",
    responsive: [
      { breakpoint: 990, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      {
        breakpoint: 560,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
    ],
  });
  $(".autoplayActualiter").slick({
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: "<button type='button' class='slick-prev pull-left'></button>",
    nextArrow: "<button type='button' class='slick-next pull-right'></button>",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: true,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
      {
        breakpoint: 560,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
    ],
  });
  $(".autoplayMarque").slick({
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
    prevArrow: "<button type='button' class='slick-prev pull-left'></button>",
    nextArrow: "<button type='button' class='slick-next pull-right'></button>",
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: true,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
    ],
  });
  $(".autoplayPlusDeMarque").slick({
    slidesToShow: 6,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
    prevArrow: "<button type='button' class='slick-prev pull-left'></button>",
    nextArrow: "<button type='button' class='slick-next pull-right'></button>",
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
          arrows: true,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          arrows: true,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: false,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
      {
        breakpoint: 520,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
    ],
  });
  $(".centerBlocInstaTikTok").slick({
    centerMode: true,
    centerPadding: "85px",
    slidesToShow: 5,
    cssEase: "linear",
    variableWidth: true,
    arrows: true,
    prevArrow: $(".content-arrows-insta").parent().find(".slick-prev"),
    nextArrow: $(".content-arrows-insta").parent().find(".slick-next"),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "40px",
          slidesToShow: 3,
          arrows: true,
          prevArrow: $(".content-arrows-insta").parent().find(".slick-prev"),
          nextArrow: $(".content-arrows-insta").parent().find(".slick-next"),
        },
      },
      {
        breakpoint: 480,
        settings: {
          arrows: false,
          centerMode: true,
          slidesToShow: 1,
          arrows: true,
          prevArrow: $(".content-arrows-insta").parent().find(".slick-prev"),
          nextArrow: $(".content-arrows-insta").parent().find(".slick-next"),
        },
      },
    ],
  });
  $(".for-news-new").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
    mobileFirst: true,
    responsive: [
      { breakpoint: 768, settings: "unslick" },
      { breakpoint: 560, settings: "unslick" },
    ],
  });
  $(".link-ancre")
    .addClass("remdec")
    .slick({
      slidesToShow: 2,
      slidesToScroll: 1,
      initialSlide: 0,
      centerMode: true,
      arrows: false,
      dots: false,
      variableWidth: true,
      mobileFirst: true,
      responsive: [{ breakpoint: 768, settings: "unslick" }],
    });
  if (window.location.pathname == "/") {
    $(".reseaux-sociaux-menu").addClass("reseaux-sociaux-menu-active");
    $("#dropdown-zento").addClass("reseaux-sociaux-menu-active");
  } else {
    $(".reseaux-sociaux-menu").removeClass("reseaux-sociaux-menu-active");
    $("#dropdown-zento").removeClass("reseaux-sociaux-menu-active");
  }
  $(".carousel").on("swipeleft", function (event) {
    $(this).carousel("next");
  });
  $(".carousel").on("swiperight", function (event) {
    $(this).carousel("prev");
  });
  $("#slider-341-34").on("swipeleft", function (event) {
    $(this).carousel("next");
  });
  $("#slider-341-34").on("swiperight", function (event) {
    $(this).carousel("prev");
  });
  $(window).on("resize", function () {});
  sliderProduitDétails();
  sliderPageStoreLocator();
  getColor();
  itemClickEvent();
  $(window).scroll(function () {
    const height = $(window).scrollTop();
    some_number = 725;
    if (height > some_number) {
      $("#btn-back-top").addClass("activebtnback");
    } else {
      $("#btn-back-top").removeClass("activebtnback");
    }
  });
  ajusterHauteurParent();
});
function ajusterHauteurParent() {
  if (window.innerWidth <= 768) {
    $(".into-mag").each(function () {
      var h2Element = $(this).find("h2");
      var parentElement = $(this);
      if (h2Element.length > 0 && parentElement.length > 0) {
        var nombreDeLignes = Math.ceil(
          h2Element.height() / parseFloat(h2Element.css("line-height")),
        );
        if (nombreDeLignes === 1) {
          $(this).addClass("get-height-min");
        } else if (nombreDeLignes > 1) {
          $(this).addClass("get-height-max");
        }
      }
    });
  } else {
    $(".into-mag").removeClass("get-height-min");
    $(".into-mag").removeClass("get-height-max");
  }
}
$(window).resize(function () {
  ajusterHauteurParent();
});
$(window).scroll(function () {
  if ($(window).width() > 560) {
    if ($(window).scrollTop() === 0) {
      $("#header").removeClass("header-fixed");
    } else {
      $("#header").addClass("header-fixed");
    }
  }
});
function destroySliderSlick() {
  if ($(".thumbnail-produit-slider").hasClass("slick-initialized")) {
    $(".thumbnail-produit-slider").slick("destroy");
  }
}
function sliderProduitDétails() {
  if ($(".thumbnail-produit-slider").hasClass("slick-initialized")) {
    $(".thumbnail-produit-slider").slick("destroy");
  }
  $(".thumbnail-produit-slider").slick({
    vertical: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    prevArrow:
      "<button type='button' class='slick-prev  produit-slider-prev'></button>",
    nextArrow:
      "<button type='button' class='slick-next  produit-slider-next'></button>",
    responsive: [],
  });
}
function sliderPageStoreLocator() {
  if ($(".thumbnail-store-locator-slider").hasClass("slick-initialized")) {
    $(".thumbnail-store-locator-slider").slick("destroy");
  }
  $(".thumbnail-store-locator-slider").slick({
    vertical: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    prevArrow:
      "<button type='button' class='slick-prev  produit-slider-prev'></button>",
    nextArrow:
      "<button type='button' class='slick-next  produit-slider-next'></button>",
    responsive: [
      {
        breakpoint: 768,
        settings: {
          vertical: false,
          slidesToShow: 4,
          slidesToScroll: 1,
          arrows: true,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
      {
        breakpoint: 560,
        settings: {
          vertical: false,
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
        },
      },
    ],
  });
}
$(".backToBussiness").click(function () {
  $("html, body").animate({ scrollTop: 0 }, 800);
});
function itemClickEvent() {
  $(".img-bg-zento").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 800);
  });
}
function removeFilterFirstChild() {
  $("#myTab li:first-child a span img").removeClass("active-filter-img");
  $("#myTab li:last-child a span img").addClass("active-filter-img");
}
function removeFilterLastChild() {
  $("#myTab li:first-child a span img").addClass("active-filter-img");
  $("#myTab li:last-child a span img").removeClass("active-filter-img");
}
function offModal() {}
function facetResponsiveMobile() {
  setTimeout(function () {
    $(".dropdown").addClass("open");
  }, 0);
}
function arrowAnimation(e) {
  const targetIMG =
    e.target.nodeName === "IMG" ? e.target : e.target.firstElementChild;
  const targetH4 = e.target.nodeName === "IMG" ? e.target.parentNode : e.target;
  const classArrowIMG = "." + targetIMG.className.split(" ")[1];
  const classArrowH4 = "." + targetH4.className.split(" ")[1];
  $(classArrowIMG).toggleClass("zto-reverse-arrow");
  $(classArrowIMG).toggleClass("arrow-animation-green");
  $(classArrowH4).toggleClass("green-text");
}
function arrowAnimanition3() {
  $(".arrow-animation3").toggleClass("zto-reverse-arrow");
}
function arrowAnimanitionId(id) {
  $(".arrow-animation" + id).toggleClass("zto-reverse-arrow-green");
  $("#accordion" + id + " button").toggleClass("zto-reverse-arrow-green-text");
}
function getColor() {
  var bgcolor = $("#bloc-btn-custom").css("backgroundColor");
  var color = "#D64560";
  $("#bloc-btn-custom").on("mouseover", function () {
    $("#bloc-btn-custom").css("backgroundColor", color);
  });
  $("#bloc-btn-custom").on("mouseout", function () {
    $("#bloc-btn-custom").css("backgroundColor", bgcolor);
  });
}
var currentCarouselIndex = 0;
var carouselMoveOffset = 0;
function moveCarousel(carousel, idx) {
  if (currentCarouselIndex > idx && currentCarouselIndex - idx > 1) {
    carouselMoveOffset = 1;
  } else if (currentCarouselIndex < idx && idx - currentCarouselIndex > 1) {
    carouselMoveOffset = 1;
  } else {
    carouselMoveOffset = 0;
  }
  carousel.carousel(idx);
}
$("#slider-229").on("slide.bs.carousel", function (e) {
  var color = $("div.item.active").data("color");
  $('button[data-color="#AD7010"]').removeClass("active-brown");
  $('button[data-color="#E7535F"]').removeClass("active-pourpre");
  $('button[data-color="#12A09B"]').removeClass("active-green");
  if (e.relatedTarget.classList.value === "item selected-zento sort-0") {
    $('button[data-color="#E7535F"]').addClass("active-pourpre");
  } else if (e.relatedTarget.classList.value === "item selected-zento sort-1") {
    $('button[data-color="#12A09B"]').addClass("active-green");
  } else if (e.relatedTarget.classList.value === "item selected-zento sort-2") {
    $('button[data-color="#AD7010"]').addClass("active-brown");
  } else {
    console.log("nothing relatedTarget", e.relatedTarget.classList.value);
  }
});
let resized = false;
$(document).ready(function () {
  function checkScreenWidth() {
    if ($(window).innerWidth() <= 768) {
      if (resized == true) {
        return;
      }
      $('nav[data-block-id="aPropos"]').click(function () {
        $(this).toggleClass("activeMenuFooter");
        $(".aPropos").toggleClass("afterPlus");
        $(".aPropos").toggleClass("afterMoins");
      });
      $('nav[data-block-id="aideInformation"]').click(function () {
        $(this).toggleClass("activeMenuFooter");
        $(".aideInformation").toggleClass("afterPlus");
        $(".aideInformation").toggleClass("afterMoins");
      });
      resized = true;
    } else {
      resized = false;
      $('nav[data-block-id="aideInformation"]').unbind("click");
      $('nav[data-block-id="aPropos"]').unbind("click");
    }
  }
  checkScreenWidth();
  $(window).resize(checkScreenWidth);
});
$(document).ready(function () {
  handleMenuHover(
    $(".first-navigation-zento").find("li"),
    $(".first-navigation-zento>li>a>span"),
  );
  function handleMenuHover(item, itemA) {
    itemA.on("mouseenter", function (e) {
      $(e.currentTarget)
        .parent("a")
        .parent("li")
        .siblings("li")
        .removeClass("open");
      var navElement = document.getElementById("openMenu");
      var ulElements = document.querySelectorAll(
        ".nav.navbar-nav.first-navigation-zento",
      );
      navElement.style.height = "470px";
      ulElements.forEach(function (ulElement) {
        ulElement.style.height = "470px";
      });
    });
    item.on("mouseenter", function (e) {
      $(e.currentTarget)
        .siblings("li")
        .find("ul")
        .removeClass("active-display-block");
    });
    item
      .find("ul:first")
      .find("li")
      .on("mouseenter", function (e) {
        $(e.currentTarget)
          .siblings("li")
          .find("ul")
          .removeClass("active-display-block");
        $(e.currentTarget).find("ul:first").addClass("active-display-block");
      });
  }
});
function newCouponCodeZento() {
  $(".open_new_coupon_code").toggleClass("active-code-promo");
  $(".resum-panier-card-price .content-code-promo label").toggleClass(
    "black-zento-important",
  );
  $(".cross-zento-code-promo").toggleClass("visible-zento");
}
function removePopUpUpdate() {
  $(".pop-up-validate-quantity").css("visibility", "hidden");
}
function pointInfo() {
  $(".content-points-info").toggleClass("active-points");
}
function openModalImageZoom() {
  var source = document.getElementById("monImageContent").src;
  var largeur = window.innerWidth;
  if (largeur < 768) {
    $(".modal-zento-zoom-image").addClass("visible-zento");
    $(".container-fluid").css("overflow-y", "hidden");
    $("#monImage").attr("src", source);
  }
}
function closeModalImageZoom() {
  $(".modal-zento-zoom-image").removeClass("visible-zento");
  $(".container-fluid").css("overflow-y", "visible");
}
function sortFacets(facets) {
  return facets;
}
$(document).ready(function () {
  var params = {};
  loadScenarios(params);
});
$(document).on("mousedown", ".modal-rbs-catalog-quick-buy", function (e) {
  window.__change.variantSelected = undefined;
});
$(".menu-icon-zento").click(function () {
  $("#openMenu").toggleClass("openMenu");
});
$(document).ready(function () {
  $(".mon-ancre-lienA").click(function (event) {
    event.preventDefault();
    var target = $(".cat-moment");
    if (target) {
      var offset = target.offset().top - 263;
      $("html, body").animate({ scrollTop: offset }, 1000);
    }
  });
  $(".mon-ancre-lienB").click(function (event) {
    event.preventDefault();
    var target = $(".week-product");
    if (target) {
      var offset = target.offset().top - 143;
      $("html, body").animate({ scrollTop: offset }, 1000);
    }
  });
  $(".mon-ancre-lienC").click(function (event) {
    event.preventDefault();
    var target = $(".promo-week");
    if (target) {
      var offset = target.offset().top - 143;
      $("html, body").animate({ scrollTop: offset }, 1000);
    }
  });
  $(".openFilters").click(function (e) {
    $("html, body").animate({ scrollTop: 0 }, 800);
    $("#filter-pop").addClass("filter-pop-on", 3000, "linear");
    $(".content-sidebar").addClass("heightContent");
    $(".container-fluid").addClass("body-overflowhidden");
  });
  $(".close-filters").click(function (e) {
    $("#filter-pop").removeClass("filter-pop-on", 10000, "linear");
    $(".content-sidebar").removeClass("heightContent");
    $(".container-fluid").removeClass("body-overflowhidden");
  });
});
$(document).ready(function () {
  $(".menu-icon-zento").on("click", function () {
    var maxHeight;
    function adjustMenuHeight() {
      var navElement = document.getElementById("openMenu");
      var ulElements = document.querySelectorAll(
        ".nav.navbar-nav.first-navigation-zento",
      );
      navElement.style.height = "400px";
      if (navElement.scrollHeight < 400) {
        navElement.style.height = "400px";
      } else {
        navElement.style.height = navElement.scrollHeight + "px";
      }
      ulElements.forEach(function (ulElement) {
        ulElement.style.height = navElement.scrollHeight + "px";
      });
    }
    function adjustChildMenuHeight(itemId, className) {
      var itemElement = document.getElementById("menu-zento-item-" + itemId);
      var childUlElement = itemElement.querySelector(className);
      if (childUlElement && childUlElement.children.length > 0) {
        itemElement.classList.add("temp-show");
        setTimeout(function () {
          var contentHeight = Array.from(childUlElement.children)
            .map(function (child) {
              return parseFloat(getComputedStyle(child).height);
            })
            .reduce(function (acc, height) {
              return acc + height;
            }, 0);
          if (contentHeight > 300) {
            childUlElement.style.height = contentHeight + "px";
            setTimeout(function () {
              itemElement.classList.remove("temp-show");
              adjustMenuHeight();
            }, 10);
          } else {
            childUlElement.style.height = "460px";
            var navElement = document.getElementById("openMenu");
            var ulElements = document.querySelectorAll(
              ".nav.navbar-nav.first-navigation-zento",
            );
            navElement.style.height = "470px";
            ulElements.forEach(function (ulElement) {
              ulElement.style.height = "460px";
            });
          }
        }, 10);
      }
    }
    setTimeout(adjustMenuHeight, 100);
    window.addEventListener("resize", adjustMenuHeight);
    var menuItems = document.querySelectorAll(".id-menu-zento-item");
    menuItems.forEach(function (menuItem) {
      menuItem.addEventListener("click", function () {
        var itemId = this.id.split("-").pop();
        adjustChildMenuHeight(itemId, ".dropdown-menu");
      });
    });
    $(document).on("mouseover", ".dropdown-menu", function (e) {
      var navElement = document.getElementById("openMenu");
      var itemElement = this;
      var childUlElement = itemElement.querySelector(".dropdown-sub-menu");
      var childUlElement2 = itemElement.querySelector(
        ".dropdown-sub-menu .dropdown-sub-menu",
      );
      if (childUlElement && childUlElement.children.length > 0) {
        itemElement.classList.add("temp-show");
        var contentHeight = Array.from(childUlElement.children)
          .map(function (child) {
            return parseFloat(getComputedStyle(child).height);
          })
          .reduce(function (acc, height) {
            return acc + height;
          }, 0);
        childUlElement.style.height = contentHeight + "px";
        itemElement.classList.remove("temp-show");
        adjustMenuHeight();
      }
      if (childUlElement2 && childUlElement2.children.length > 0) {
        itemElement.classList.add("temp-show");
        var contentHeight = Array.from(childUlElement2.children)
          .map(function (child) {
            return parseFloat(getComputedStyle(child).height);
          })
          .reduce(function (acc, height) {
            return acc + height;
          }, 0);
        childUlElement2.style.height = contentHeight + "px";
        itemElement.classList.remove("temp-show");
        adjustMenuHeight();
      }
    });
  });
});
